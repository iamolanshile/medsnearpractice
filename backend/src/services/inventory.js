const supabase = require('../lib/supabase')

/**
 * Search for a drug near a given lat/lng within radiusKm
 */
async function searchDrugNearby(drugName, lat, lng, radiusKm = 10) {
  // Use PostGIS ST_DWithin for proximity search
  const radiusMeters = radiusKm * 1000

  const { data, error } = await supabase.rpc('search_drug_nearby', {
    drug_query: drugName,
    user_lat: lat,
    user_lng: lng,
    radius_m: radiusMeters
  })

  if (error) {
    // Fallback: text search without geo if RPC not available
    const { data: fallback } = await supabase
      .from('inventory')
      .select('id, drug_name, brand, price, quantity, is_available, pharmacies(id, name, address, lga, lat, lng)')
      .ilike('drug_name', `%${drugName}%`)
      .eq('is_available', true)
      .order('price', { ascending: true })
      .limit(5)
    return fallback || []
  }

  return data || []
}

module.exports = { searchDrugNearby }
