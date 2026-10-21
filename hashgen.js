const bcrypt = require('bcryptjs')

async function main() {
  const hash = await bcrypt.hash('AaicaAdmin#99', 10)
  console.log('Hash:', hash)
}

main()
