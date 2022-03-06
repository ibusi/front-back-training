import {
  Center,
  Text,
  Heading,
  VStack,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import TransactionsTable from "./components/TransactionsTable.js";
import { ChakraProvider } from "@chakra-ui/react";
import Summary from "./components/Summary";
import Visualization from "./components/Visualization";
import AddModal from "./components/AddModal";


//Reactについて

// hook
// Reactの state やライフサイクルの機能などを、関数コンポーネント内に使用できるようにするための関数です。

// コンポーネント
// UI 上で独立した再利用できる部品のことであり、関数やクラスで表現することができる
// 関数コンポーネント
// JSXを返すプレーンなJavaScript関数
// 例
// const FunctionalComponent = () => {
//  return <h1>Hello, world</h1>;
// };

// useState
// useState()は、関数コンポーネントでstateを管理（stateの保持と更新）するためのフックであり、最も利用されるフック
// state
// コンポーネントが内部で保持する「状態」のことで、画面上に表示されるデータ等、アプリケーションが保持している状態を指す。
// stateはpropsと違い後から変更することができる
// useStateの基本形
// const [状態変数, 状態を変更するための関数] = useState(状態の初期値);
// const [count, setCount] = useState(initialState)
// useState の左辺の state 変数には任意の名前を付けることが出来る
// （分割代入構文的な）
// 1つ目の要素： state の現在の値
// 2つ目の要素： state の現在の値を更新するための関数
// state が更新されても initialState はinitialState として保持される
// 例
// const [count, setCount] = useState(0)
// 関数名がcount 初期値が0 setCountが動けばcountの値が変化する

// useEffect
// レンダリングによって引き起こされる処理。コンポーネントに変更が起こるとreturnの中身が再レンダリングされる、その時に起こる処理
// useEffect(() => {
//  実行させたい処理
// })
// これでレンダリングのたびに処理がされる
// 第二引数に依存する配列を記入できる
// useEffect(() => {
//  実行させたい処理
// },[依存する配列])
// もし配列が空[]だとuseeffectは初回のレンダリングのみ実行される
// 何かしら中身があればそれが変更される度に実行される


// export default
// そのファイルのデフォルトとして後ろに続くものをexportするよ、という意味
// export defaultされたものを使いたい時、importする側は任意の名前をつけることができる。それは、これをデフォルトだと宣言しているから。
// デフォルトを複数指定することはできない。なので、１ファイル内にさっきのconnectのようなexport default宣言を複数書くとエラーが出る

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [portfolioCost, setPortfolioCost] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [absoluteGain, setAbsoluteGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [rollups, setRollups] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_rollups_by_coin")
      .then((response) => response.json())
      .then((data) => {
        setRollups(data);
        let costAccumulator = 0;
        let valueAccumulator = 0;
        // The forEach() method executes a provided function once for each array element.
        // const array1 = ['a', 'b', 'c'];
        // array1.forEach(element => console.log(element));
        // expected output: "a"
        // expected output: "b"
        // expected output: "c"
        data.forEach((item) => {
          costAccumulator += item["total_cost"];
          valueAccumulator += item["total_equity"];
        });
        let absoluteGain = valueAccumulator - costAccumulator;

        setPortfolioCost(costAccumulator);
        setPortfolioValue(valueAccumulator);
        setAbsoluteGain(absoluteGain);
        setTotalGainPercent((absoluteGain / costAccumulator) * 100);
      });
    fetch("http://127.0.0.1:5000/transactions")
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
      });
  }, [isOpen]);

  return (
    // チャクラUIを利用するにはChakuraProviderを利用する必要がある

    // Center is a layout component that centers its child within itself

    // Stack
    // 要素を縦や横の一方向に並べる。それを簡便に行うためのコンポーネントが<Stack>。次の3種類。
    // VStack：子要素を縦方向に並べる
    // HStack：子要素を横方向に並べる
    // Stack：子要素を縦方向や横方向に並べる

    // Headings are used for rendering headlines.

    // Text component is the used to render text and paragraphs within an interface. It renders a <p> tag by default.

    // The Button component is used to trigger an action or event, such as submitting a form, opening a dialog.....

    <ChakraProvider>
      <AddModal isOpen={isOpen} onOpen={onOpen} onClose={onClose}></AddModal>
      <Center bg="black" color="green" padding={8}>
        <VStack spacing={7}>
          <Heading>Crypto portfolio</Heading>
          <Text>This is the current state of your portfolio</Text>
          <Button size="lg" colorScheme="teal" onClick={onOpen}>
            Add Transaction
          </Button>
          <Summary
            portfolioCost={portfolioCost}
            portfolioValue={portfolioValue}
            absoluteGain={absoluteGain}
            totalGainPercent={totalGainPercent}
          ></Summary>
          <Visualization rollups={rollups}></Visualization>
          <TransactionsTable transactions={transactions}></TransactionsTable>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}