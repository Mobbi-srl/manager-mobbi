import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Starting station documents cleanup...')

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get all files in the partner-documenti bucket that are related to stations
    const { data: files, error: listError } = await supabase.storage
      .from('partner-documenti')
      .list('', {
        limit: 1000,
        offset: 0
      })

    if (listError) {
      console.error('❌ Error listing files:', listError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to list files',
          details: listError 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📁 Found ${files?.length || 0} files in storage`)

    // Filter files that contain station-related patterns (documento_allegato, stazione, etc.)
    const stationFiles = files?.filter(file => 
      file.name.includes('stazione') || 
      file.name.includes('documento') ||
      file.name.toLowerCase().includes('station')
    ) || []

    console.log(`🏭 Found ${stationFiles.length} station-related files to delete`)

    let deletedCount = 0
    let errors: any[] = []

    // Delete each station-related file
    for (const file of stationFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from('partner-documenti')
          .remove([file.name])

        if (deleteError) {
          console.error(`❌ Error deleting file ${file.name}:`, deleteError)
          errors.push({ file: file.name, error: deleteError })
        } else {
          console.log(`✅ Deleted file: ${file.name}`)
          deletedCount++
        }
      } catch (error) {
        console.error(`❌ Exception deleting file ${file.name}:`, error)
        errors.push({ file: file.name, error: error })
      }
    }

    console.log(`🎯 Cleanup completed: ${deletedCount} files deleted, ${errors.length} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Station documents cleanup completed',
        stats: {
          totalFiles: files?.length || 0,
          stationFiles: stationFiles.length,
          deleted: deletedCount,
          errors: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unexpected error during cleanup',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})