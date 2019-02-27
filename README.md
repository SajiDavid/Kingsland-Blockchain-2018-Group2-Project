# Kingsland-Blockchain-2018-Group2-Project
Group2 - Jey, Calvin and Thulaja <br>

## Project Structure
Currently /main.js is the core file which has all the Classes<br>
Block Class       ->  /app/components/block.js<br>
Blockchain Class  ->  /app/components/blockchain.js<br>
Router Class      ->  /routes/routes.js<br>

### Steps to start nodes
- Clone the Master Branch to your system
- cd to Kingsland-Blockchain-2018-Group2-Project folder
- execute **node main.js --port=<0000> [--mining=yes]** to start the node
### For additional nodes with different port#
- execute **node main.js --port=<0000>**  e.g node main.js --port=7550
### For Enable Mining
- execute **node main.js --port=<0000> --mining=yes
  
### End Points URL to access in browser
- http://localhost:5550           ->    Home Page
- http://localhost:5550/faucet    ->    Faucet Page
- http://localhost:5550/blocks    ->    Block Explorer
- http://localhost:5550/wallet    ->    Wallet





Thanks.
