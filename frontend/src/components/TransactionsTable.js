import React from "react";
import {
    Text,
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    TableCaption,
} from "@chakra-ui/react";
import TransactionItem from "./TransactionItem";

export default function TransactionsTable({ transactions }) {
    return (
        // Table
        // Tables are used to organize and display data efficiently. It renders a <table> element by default.
        // TableCaption
        // The placement of the table caption. This sets the `caption-side` CSS attribute.
        // thead
        // 表のヘッダ部分となる行のグループを表す
        // tr
        // 表の行を表します
        // th
        // 表の見出しセルを表す
        // tbody
        // 表の本体部分を表す

        // mapは配列データに使うメソッドであり、各要素1つずつに対して「コールバック関数」を実行し、その結果を新しい配列として返すことが出来る
        // var items = [1,2,3,4,5];
        // var result = items.map(function( value ) {
        //     //配列の各要素を2倍にする
        //     return value * 2;
        // });
        // console.log( result );
        // 出力結果は…
        // [2, 4, 6, 8, 10]

        <VStack>
            <Text> Recent Transactions</Text>
            <Table size="sm" variant="striped" colorScheme="blackAlpha" width={20}>
                <TableCaption>All crypto buy and sell records</TableCaption>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Symbol</Th>
                        <Th>Amount</Th>
                        <Th>Number of Coins</Th>
                        <Th>Price Purchased At</Th>
                        <Th>Date</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {transactions.map((tran, index) => {
                        return (
                            <TransactionItem key={index} transaction={tran}></TransactionItem>
                        );
                    })}
                </Tbody>
            </Table>
        </VStack>
    );
}