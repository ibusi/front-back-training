import React from "react";
import { Container, Text, VStack, HStack } from "@chakra-ui/react";

// このファンクションの引数はApp.jsの<Summary>の中で宣言された値（多分）
export default function Summary({
    portfolioCost,
    portfolioValue,
    absoluteGain,
    totalGainPercent,
}) {
    // The Number() 
    // creates a Number object.
    // toFixed()
    // 引数の数だけの小数点を作るor残す
    // toLocaleString()
    // 数値を引数に指定したロケールに合わせた形に変換したあと、そのあとで文字列に変換した値を返す。
    // 引数を省略した場合はデフォルトロケールが指定されたものとして扱われる
    // 例
    // let num = 8242.56;
    // console.log(num.toLocaleString());
    // >> 8,242.56
    // console.log(num.toLocaleString('ja-JP'));
    // >> 8,242.56
    // console.log(num.toLocaleString('de-DE'));
    // >> 8.242,56

    // Containers are used to constrain a content's width to the current breakpoint, while keeping it fluid
    return (
        <HStack spacing={6}>
            <Container bg="white">
                <VStack width={40}>
                    <Text fontSize="2xl">
                        $ {Number(portfolioCost.toFixed(2)).toLocaleString()}
                    </Text>
                    <Text fontSize="xs" size="md">
                        Portfolio Cost
                    </Text>
                </VStack>
            </Container>
            <Container bg="white">
                <VStack width={40}>
                    <Text fontSize="2xl">
                        $ {Number(portfolioValue.toFixed(2)).toLocaleString()}
                    </Text>
                    <Text fontSize="xs">Portfolio Value</Text>
                </VStack>
            </Container>
            <Container bg="white">
                <VStack width={40}>
                    <Text fontSize="2xl">
                        $ {Number(absoluteGain.toFixed(2)).toLocaleString()}
                    </Text>
                    <Text fontSize="xs"> Absolute Gain / Loss </Text>
                </VStack>
            </Container>
            <Container bg="white">
                <VStack width={40}>
                    <Text fontSize="2xl">{totalGainPercent.toFixed(2)} %</Text>
                    <Text fontSize="xs">Gain / Loss %</Text>
                </VStack>
            </Container>
        </HStack>
    );
}