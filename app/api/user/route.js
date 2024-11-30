import { supabase } from '@/lib/client'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    console.log('Received data:', data)

    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert([{
        name: data.name,
        email: data.email,
        role: 'student'
      }])
      .select()
      .single()

    console.log('User insert result:', userData)
    console.log('User error:', userError)

    if (userError) throw userError

    const { data: studentData, error: studentError } = await supabase
      .from('student')
      .insert([{
        user_id: userData.id,
        program: data.program,
        degree: data.degree,
        year_of_study: parseInt(data.year)
      }])
      .select()
      .single()

    console.log('Student insert result:', studentData)
    console.log('Student error:', studentError)

    if (studentError) throw studentError

    return NextResponse.json({ user: userData, student: studentData }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}