import { supabase } from '../../../../lib/client';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try{
        const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', params.id)
        .single()
        
        if (error){
            return NextResponse.json({ error: error.message }, { status: 500});
        }
    
        if (!data){
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    
    } catch(error){
        return NextResponse.json({ error: error.message }, { status: 500});
    }
}