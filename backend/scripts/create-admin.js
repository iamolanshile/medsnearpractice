/**
 * Run this once to create the first admin account:
 *   node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const supabase = require('../src/lib/supabase')

const EMAIL = 'admin@medsnear.com'
const PASSWORD = 'Admin@1234'

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10)

  const { data, error } = await supabase
    .from('admins')
    .insert({ email: EMAIL, password_hash: hash })
    .select('id, email')
    .single()

  if (error) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin created successfully')
  console.log('   Email   :', data.email)
  console.log('   Password:', PASSWORD)
  console.log('\n⚠️  Change this password after first login!')
}

main()
