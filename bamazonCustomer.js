const { prompt } = require('inquirer')
const { createConnection } = require('mysql2')

const db = createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'destiny1',
  database: 'bamazon'
})

async function getProducts(columns) {
  let response = await new Promise((resolve, reject) => {
    db.query(`SELECT ${columns} FROM products`, (e, r) => {
      if (e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })

  return response
}


const getProduct = _ => {
  getProducts('item_id')
    .then(r => {
      prompt([
          {
        type: 'list',
        name: 'item_id',
        message: 'Select the Tshirt you would like to buy:',
        choices: r.map(({ item_id }) => item_id)
      },{
          type:'input',
          name: 'quantity',
          message: 'How much would you like to buy'
      }
    ]).then(input =>{
          console.log(input.item_id)
          console.log(input.quantity)
          let id = input.item_id
          let quantity = input.quantity
          db.query('SELECT * FROM products', (e,r)=>{
              if(e) console.log(e)
              else{ 
                  if(quantity <= r[id].stock_quantity){
                      console.log('Sucesss! Thank you for your bussiness')
                  } else{
                      console.log('sorry no more in stock!')
                  }
              }
          }) 
      })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
}

const addSong = _ => {
  prompt([
    {
      type: 'input',
      name: 'product_name',
      message: 'What is the name of the product?'
    },
    {
      type: 'input',
      name: 'price',
      message: 'What is the price of the product'
    },
    {
      type: 'input',
      name: 'stock_quantity',
      message: 'How much in stock'
    }
  ])
    .then(product => {
      db.query('INSERT INTO products SET ?', product, e => {
        if (e) throw e
        console.log('*** Successfully added your product! ***')
        getAction()
      })
    })
}

const getAction = _ => {
  prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: ['View Products of Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product','--EXIT--']
  })
    .then(({ action }) => {
      switch (action) {
        case 'View Products of Sale':
          getProducts('*')
            .then(r => {
              r.forEach(({ item_id, product_name, price, stock_quantity }) => console.log(`
                ----------
                ID:${item_id}, Product: ${product_name}, Price: ${price}, stock: ${stock_quantity} 
                ----------
              `))
              getProduct()
            })
            .catch(e => console.log(e))
          break
        case 'View low Inventory':
          getSong()
          break
        case 'Add to Inventory':
          addSong()
          break
        case 'Add New Product':
          updateSong()
          break
        case '--EXIT--':
          process.exit()
        default:
          getAction()
          break
      }
    })
    .catch(e => console.log(e))
}

db.connect(e => e ? console.log(e) : getAction())