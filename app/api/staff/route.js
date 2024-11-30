import { supabase } from '@/lib/client'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    console.log('Received data:', data)

    // Map front-end role names to database enum values
    let userRole;
    let staffTable;
    switch (data.role.toLowerCase()) {
      case 'supervisor':
        userRole = 'supervisor'
        staffTable = 'supervisor'
        break
      case 'graduate program assistant':
        userRole = 'gpa'
        staffTable = 'graduate_program_assistant'
        break
      case 'graduate program director':
        userRole = 'gpd'
        staffTable = 'graduate_program_director'
        break
      default:
        throw new Error('Invalid staff role')
    }

    // Create user record with specific role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert([{
        name: data.name,
        email: data.email,
        role: userRole  // Use specific role enum value
      }])
      .select()
      .single()

    console.log('User insert result:', userData)
    if (userError) throw userError

    const { data: staffData, error: staffError } = await supabase
      .from(staffTable)
      .insert([{
        user_id: userData.id,
        department: data.department
      }])
      .select()
      .single()

    console.log(`${staffTable} insert result:`, staffData)
    if (staffError) throw staffError

    return NextResponse.json({ 
      user: userData, 
      staffData: staffData,
      staffType: staffTable
    }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}