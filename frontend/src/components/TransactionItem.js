import React from "react";

import { Tr, Td } from "@chakra-ui/react";

export default function TransactionItem({ transaction }) {
    return (
        // td
        // table dataの略で、テーブルセルの内容を指定する。セルの内容がデータの場合は、この<td>要素を使用。
        // isNumeric
        // Aligns the cell content to the right
        <Tr>
            <Td>{transaction["name"]}</Td>
            <Td>{transaction["symbol"]}</Td>
            <Td isNumeric>$ {transaction["amount"].toLocaleString()}</Td>
            <Td isNumeric>{transaction["no_of_coins"]}</Td>
            <Td isNumeric>$ {transaction["price_purchased_at"].toLocaleString()}</Td>
            <Td isNumeric>{transaction["time_transacted"]}</Td>
        </Tr>
    );
}