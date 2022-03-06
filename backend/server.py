import datetime
import requests

from collections import defaultdict

from datetime import datetime
from urllib import response

# psycopg2は簡単に言うと、PythonからPostgreSQLへアクセスするためのライブラリ
from psycopg2 import pool

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from logic import BOUGHT, SOLD
from logic import format_db_row_to_transaction


LIVE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price"

# import flask という行は、 flask という名前のモジュールを読み込んで、 flask という名前の変数に代入している。
# Python は数値や文字列だけでなく、モジュールやクラスなども全てオブジェクトで、 変数に代入して利用する
# app = flask.Flask(__name__) という行は、 Flask クラスのインスタンスを作って、 app という変数に代入している。
# オブジェクトの属性にアクセスする場合は、 . という記号を使って、 オブジェクト名.要素名 のようにする
# クラスのインスタンスの場合はメソッドやメンバ変数が属性になりますが、 モジュールの場合はそのモジュールが持っているクラスや関数などが属性になる。 この場合、 flask モジュールが提供している Flask クラスを利用していることになります。
# Python でクラスのインスタンス化するときは、単にクラスを関数のように呼び出すだけで、 new などのキーワードや特別な構文は必要ない
# __name__ というのは、自動的に定義される変数で、現在のファイルのモジュール名が入る
# ファイルをスクリプトとして直接実行した場合、 __name__ は __main__ になる
# import flask の代わりに、 from flask import Flask と書くと、 flask.Flask クラスを Flask という変数に代入する。
# こうすると、 app = flask.Flask(__name__) の代わりに app = Flask(__name__) と書くことができる
app = Flask(__name__)

# CORSはAPIを使用する時に使用する。
# 例えばJSからこのページで作成したURL上のデータをAPIで使用するときはそのページにjsonifyでjsonのデータを作成してfetch等でJSから引っ張る
cors = CORS(app)

# アプリケーションからPostgreSQLに接続する際、主に以下の処理が行われる
# 1. Postmasterが接続リクエストを受理
# 2. バックエンドプロセスとして子プロセスを起動
# 3. ユーザやパスワード等をもとに認証
# 特に2.はOSレベルプロセスを生成するコストの高い処理（Unixの場合fork()が行われる）
# そのため大量の接続要求があった場合はfork()が大量に発生し、OSレベルでCPU高騰に至るケースもある。
#  ・fork()はコンピュータ上で実行されているプログラム（プロセス）が、自身の複製を作成して新たなプロセスとして起動することをフォークという。
#    UNIX系OSでよく利用される仕組みで、同名のシステムコール（fork）を利用して実行される。
#    元のプロセスを親プロセス、新たに生成されたプロセスを子プロセスという。
# コネクションプーリング
# アプリケーションからのリクエストごとにデータベースへ接続を行うのではなく、アプリケーション側である程度の接続を保持(プール)しておき
# 実際に必要になったタイミングで、その中から割り当てる機能。
# コネクションプーリングを利用することで、処理ごとに接続する必要がなくなるため、データベース側に与える負荷が低減される
# psycopg2.pool.SimpleConnectionPool(minConnection, maxConnection, *args, **kwargs)
# minconn is the minimum number of connections. These are the connections that will be created immediately when the pool is created.
# maxconn is the maximum number of connections. If we request a connection from the pool but we have ran out,
# a new connection will be created unless we already have maxconn connections. If that's the case, an error will be raised.
# **kwargs get passed to psycopg2.connect, so SimpleConnectionPool can actually accept any keyword arguments that psycopg2.connect
#  would accept in order to connect to the database.
postgreSQL_pool = pool.SimpleConnectionPool(
    1, 100, database="exampledb", user="docker", password="docker"
)

# flaskではこインスタンスの設定ファイルをオブジェクトのconfigからアクセスでき作成もできる。
app.config["postgresSQL_pool"] = postgreSQL_pool


# @app.route('/') という行は、 app に対して / というURLに対応するアクションを登録している。
# @ で始まる行はデコレータといって、その次の行で定義する関数やクラスに対して何らかの処理を行う。
# @app.route('/') は、次の行で定義される関数を指定した URL にマッピングするという処理を実行している
@app.route("/")
def health_check():
    return "I am healthy!!"


@app.route("/transactions", methods=["POST"])
def new_transaction():
    name = request.json["name"]
    symbol = request.json["symbol"]
    type = request.json["type"]
    amount = request.json["amount"]
    # エポック (epoch) は時刻の起点のことで、これはプラットフォーム依存。time.gmtime(0)で値を確認
    # datetime モジュールは、日付や時刻を操作するためのクラスを提供しています。
    # time.time()
    # エポック からの秒数を浮動小数点数で返します。
    # datetime.fromtimestamp(timestamp, tz=None)
    # time.time() が返すような、 タイムスタンプに対応するローカルな日付と時刻を返す
    time_transacted = datetime.fromtimestamp(request.json["time_transacted"])
    time_created = datetime.fromtimestamp(request.json["time_created"])
    # float 関数は引数に指定した数値または文字列を浮動小数点数に変換して取得
    # 例 15→15.0, 2.55→2.55
    price_purchased_at = float(request.json["price_purchased_at"])
    no_of_coins = float(request.json["no_of_coins"])

    # プールから接続(コネクション)を取得する。
    conn = postgreSQL_pool.getconn()

    # コネクションを取り出したあとは、カーソルを取得し、カーソル経由でSQLの実行や結果の取得を行う
    cur = conn.cursor()

    # SQL構文
    # INSERT INTO テーブル名 (列名1, 列名2,...) VALUES (値1, 値2,...);
    insert_satement = f"INSERT INTO transaction (name, symbol, type, amount, time_transacted, time_created, price_purchased_at, no_of_coins) VALUES ('{name}', '{symbol}', '{type}', '{amount}', '{time_transacted}', '{time_created}', '{price_purchased_at}', '{no_of_coins}')"

    cur.execute(insert_satement)
    conn.commit()
    conn.close()

    return jsonify(request.json)


# @cross_origin() below a call to Flask’s @app.route(..) to allow CORS on a given route
@app.route("/transactions")
@cross_origin()
def get_transactions():
    cur = postgreSQL_pool.getconn().cursor()
    cur.execute("SELECT * FROM TRANSACTION")
    # cursor.fetchall() fetches all the rows of a query result.
    # It returns all the rows as a list of tuples. An empty list is returned if there is no record to fetch.
    rows = cur.fetchall()
    cur.close()

    return jsonify([format_db_row_to_transaction(row) for row in rows])


@app.route("/get_rollups_by_coin")
def get_rollups_by_coin():
    # The Python defaultdict type behaves almost exactly like a regular Python dictionary,
    # but if you try to access or modify a missing key, then defaultdict will automatically create the key
    # and generate a default value for it. This makes defaultdict a valuable option for handling missing keys in dictionaries.
    portfolio = defaultdict(
        # A lambda function is a small anonymous function.
        # A lambda function can take any number of arguments, but can only have one expression.
        # def function_name(parameters, ...):
        # return expression
        # ↓は上と同じ
        # function_name = lambda parameters, ...: expression
        #
        # defaultdictとlambda
        # 例
        # x = defaultdict(lambda: 0)
        # when calling x[k] for a nonexistent key k (such as a statement like v=x[k]),
        # the key-value pair (k,0) will be automatically added to the dictionary, as if the statement x[k]=0 is first executed.
        # def_dict = defaultdict(lambda: factory('default value'))
        # def_dict['missing']
        # 'DEFAULT VALUE'
        lambda: {
            "coins": 0,
            "total_cost": 0,
            "total_equity": 0,
            "live_price": 0,
        }
    )

    conn = postgreSQL_pool.getconn()
    cur = conn.cursor()
    cur.execute(
        "SELECT symbol, type, SUM(amount)/100 AS total_amount, SUM(no_of_coins) AS transaction_coins FROM transaction GROUP BY symbol, type"
    )
    rows = cur.fetchall()
    for row in rows:
        coin = row[0]
        transaction_type = row[1]
        transaction_amount = row[2]
        transaction_coins = row[3]

        if transaction_type == BOUGHT:
            portfolio[coin]["total_cost"] += transaction_amount
            portfolio[coin]["coins"] += transaction_coins
        else:
            portfolio[coin]["total_cost"] -= transaction_amount
            portfolio[coin]["coins"] -= transaction_coins

    symbol_to_coin_id_map = {
        "BTC": "bitcoin",
        "SOL": "solana",
        "LINK": "chainlink",
        "ETH": "ethereum",
        "ADA": "cardano",
        "MANA": "decentraland",
    }
    rollup_response = []

    for symbol in portfolio:
        # get()の第一引数にURLを指定するとResponseオブジェクトが取得できる
        # Responseオブジェクトの属性に様々な情報が格納されている。
        # 例 url属性
        # url属性でアクセスしたURLを取得できる。
        #   print(response.url)
        #   #https://example.com/
        # URLの末尾に?をつけてそのあとにkey=valueの形式で値を指定することでパラメータを指定できる。
        # このようなパラメータをURLパラメータやクエリパラメータ、その文字列をクエリ文字列（クエリストリング）などと呼ぶ。
        response = requests.get(
            f"{LIVE_PRICE_URL}?ids={symbol_to_coin_id_map[symbol]}&vs_currencies=usd"
        ).json()

        live_price = response[symbol_to_coin_id_map[symbol]]["usd"]
        portfolio[symbol]["live_price"] = live_price
        portfolio[symbol]["total_equity"] = float(
            float(portfolio[symbol]["coins"]) * live_price
        )

        # The append() method in python adds a single item to the existing list.
        # It doesn’t return a new list of items but will modify the original list by adding the item to the end of the list.
        # After executing the method append on the list the size of the list increases by one.
        rollup_response.append(
            {
                "symbol": symbol,
                "live_price": portfolio[symbol]["live_price"],
                "total_equity": portfolio[symbol]["total_equity"],
                "coins": portfolio[symbol]["coins"],
                "total_cost": portfolio[symbol]["total_cost"],
            }
        )

    conn.close()

    return jsonify(rollup_response)


# app.run()でWEBサーバーが起動する
# port – Webサーバーのポート。
# debug – デバッグモードの有効または無効を指定
app.run(debug=True, port=5000)
