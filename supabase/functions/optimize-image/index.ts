import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  ImageMagick,
  initialize,
  ImageMagickFormat,
} from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Initialize ImageMagick
await initialize()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let optimizedBuffer: Uint8Array
    let contentType = 'image/webp'
    let extension = 'webp'

    // Perform optimization using ImageMagick
    await ImageMagick.read(uint8Array, async (img) => {
      // Resize if too large (e.g. max width 2500px for better quality on large screens)
      if (img.width > 2500) {
        img.resize(2500, 0) // 0 maintains aspect ratio
      }

      // Set higher quality for better visual clarity (90-95)
      img.quality = 90

      // Convert to WebP
      await img.write(ImageMagickFormat.WebP, (data) => {
        optimizedBuffer = data
      })
    })

    if (!optimizedBuffer!) {
      throw new Error('Image optimization failed')
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`

    const { data, error } = await supabase.storage
      .from('assets')
      .upload(fileName, optimizedBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from('assets').getPublicUrl(fileName)

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
