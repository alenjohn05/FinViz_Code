 ### Time complexity of the `reconstructTreeFromDB` function in src/utils/treeReconstructor.ts

 - O(N * K), where N is the number of elements in the database data and K is the average number of path segments in the name string.
 - space complexity for storing the fetched data requires (O(n)) space, tree structure itself will require space proportional to the number of nodes, which is (O(m)). As (m \approx n), the space complexity can be approximated as (O(n)).

I have used Tech stack of Typescript and React
- Used **Sqlite DB** since SQLite does not support multiple concurrent write transactions, I have used **connection pooling** to manage database access more efficiently
- **Write-Ahead Logging** for better concurrent access in Sqlite Database
- Implemented **Redis** caching to reduce database load.
