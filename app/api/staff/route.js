import { supabase } from '@/lib/client'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    console.log('Received data:', data)

    let userRole;
    let staffTable;
    
    // Clean up the role string for comparison
    const roleKey = data.role.replace(/\s+/g, '').toLowerCase()
    
    switch (roleKey) {
      case 'supervisor':
        userRole = 'supervisor'
        staffTable = 'supervisor'
        break
      case 'graduateprogramassistant':
        userRole = 'graduate_program_assistant'
        staffTable = 'graduate_program_assistant'
        break
      case 'graduateprogramdirector':
        userRole = 'graduate_program_director' 
        staffTable = 'graduate_program_director'
        break
      default:
        console.error('Invalid role received:', data.role)
        throw new Error(`Invalid staff role: ${data.role}`)
    }

    console.log('Mapped role:', { original: data.role, userRole, staffTable })

    // Create user record with specific role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert([{
        name: data.name,
        email: data.email,
        role: userRole
      }])
      .select()
      .single()

    console.log('User insert result:', userData)
    if (userError) {
      console.error('User insert error:', userError)
      throw userError
    }

    const { data: staffData, error: staffError } = await supabase
      .from(staffTable)
      .insert([{
        user_id: userData.id,
        department: data.department
      }])
      .select()
      .single()

    console.log(`${staffTable} insert result:`, staffData)
    if (staffError) {
      console.error('Staff insert error:', staffError)
      throw staffError
    }

    return NextResponse.json({ 
      user: userData, 
      staffData: staffData,
      staffType: staffTable
    }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error.details || 'No additional details'
    }, { status: 400 })
  }
}