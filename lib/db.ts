import { createClient } from 'npm:@libsql/client'


export const client = createClient({
    url: "http://127.0.0.1:8080"
})


export async function updateChatAndFetch(id: string, name: string){
    return await client.execute(`insert into chats (id, name, messages_count) values (${id}, ${JSON.stringify(name)}, 1) on conflict do update set messages_count = messages_count + 1 where id = ${id} returning *`)
}
