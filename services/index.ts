import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createSqlQueryChain } from "langchain/chains/sql_db";
import { QuerySqlTool } from "langchain/tools/sql";



export const GetReply = async (question: string) => {

    const datasource = new DataSource({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        port: 5432,
        ssl: true
    })

    console.log(question);
    const db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource })

    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-pro",
    });

    const executeQuery = new QuerySqlTool(db);

    const writeQuery = await createSqlQueryChain({
        llm,
        db,
        dialect: "postgres",
    });

    const response = await writeQuery.invoke({
        question,
    });

    console.log("response", response);

    const st = response.indexOf("SELECT")
    const ed = response.indexOf(";")

    const query = response.substring(st,ed+1)
    const ansStart = response.indexOf("Answer")
    let ans;
    if(ansStart > 0){
        ans = response.substring(ansStart+8)
    }
    try{
        const dbAns = await db.run(query)
        console.log(dbAns);
        return {query,ans,dbAns}
    }catch(err){
        console.log(err); 
    }
    return { query,ans}
}
