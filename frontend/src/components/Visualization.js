import React from "react";
import { Center, Text, VStack, HStack } from "@chakra-ui/react";

import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#F28042",
    "#9fd3c7",
    "#142d4c",
    "#feff9a",
    "#ffb6b9",
    "#fae3d9",
    "#bbded6",
    "#61c0bf",
];

export default function Visualization({ rollups }) {
    // BarChart
    // グラフの種類

    // XAxis
    // X軸

    // dataKey
    // The key of data displayed in the axis.

    // Tooltip
    // グラフにカーソルが当たった時に見える情報のやつ

    // Legend
    // グラフの追加情報みたいなやつ
    // By default, the content of the legend is generated by the name of Line, Bar, Area, etc. 
    // Alternatively,  if no name has been set, the dataKey will be used to generate legend content.

    // Bar dataKey....
    // グラフの中のデータ

    // data
    // The source data which each element is an object.

    // dataKey
    // The key of each sector's value.

    //nameKeyString
    // The key of each sector's name.

    // Cell 
    // can be wrapped by Pie, Bar, or RadialBar to specify attributes of each child. 
    // In Pie , for example, we can specify the attributes of each child node through data, 
    // but the props of Cell have higher priority



    return (
        <Center>
            <VStack>
                <Text>Cost vs Equity</Text>
                <BarChart
                    width={600}
                    height={300}
                    data={rollups}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_equity" fill="#00C49F" />
                    <Bar dataKey="total_cost" fill="#FFBB28" />
                </BarChart>
                <HStack>
                    <VStack>
                        <Text>Cost Distribution</Text>
                        <PieChart width={250} height={250}>
                            <Pie data={rollups} dataKey="total_cost" nameKey="symbol">
                                {rollups.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend></Legend>
                            <Tooltip></Tooltip>
                        </PieChart>
                    </VStack>
                    <VStack>
                        <Text>Equity Distribution</Text>
                        <PieChart width={250} height={250}>
                            <Pie data={rollups} dataKey="total_equity" nameKey="symbol">
                                {rollups.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend></Legend>
                            <Tooltip></Tooltip>
                        </PieChart>
                    </VStack>
                </HStack>
            </VStack>
        </Center>
    );
}