const supabase = require('../config/db');

const placeBid = async (req, res) => {
  const { meme_id } = req.params;
  const { credits } = req.body;
  const user_id = req.user.id;

  console.log('Attempting to place bid:', { meme_id, credits, user_id });

  try {
    // Validate meme_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(meme_id)) {
      console.error('Invalid meme_id format:', meme_id);
      return res.status(400).json({ error: 'Invalid meme_id format', meme_id });
    }

    // Normalize meme_id to lowercase
    const normalized_meme_id = meme_id.toLowerCase();
    console.log('Normalized meme_id:', normalized_meme_id);

    // Query meme
    const { data: memes, error: memeError } = await supabase
      .from('memes')
      .select('id, highestbid, highestbidder')
      .eq('id', normalized_meme_id);

    if (memeError) {
      console.error('Meme query error:', {
        meme_id: normalized_meme_id,
        error: memeError.message,
        code: memeError.code,
        details: memeError.details
      });
      return res.status(500).json({
        error: 'Failed to query meme',
        meme_id: normalized_meme_id,
        details: memeError.message
      });
    }

    if (!memes || memes.length === 0) {
      console.error('Meme not found:', { meme_id: normalized_meme_id });
      return res.status(404).json({ error: 'Meme not found', meme_id: normalized_meme_id });
    }

    const meme = memes[0];
    const currentBid = meme.highestbid || 0;
    if (credits <= currentBid) {
      return res.status(400).json({ error: 'Bid must be higher than current highest bid', currentBid });
    }

    // Insert bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert([{ meme_id: normalized_meme_id, user_id, credits }])
      .select()
      .single();

    if (bidError) {
      console.error('Bid insertion error:', bidError.message);
      throw new Error(`Bid insertion failed: ${bidError.message}`);
    }

    // Update meme
    const { data: updatedMeme, error: updateError } = await supabase
      .from('memes')
      .update({ highestbid: credits, highestbidder: user_id })
      .eq('id', normalized_meme_id)
      .select()
      .single();

    if (updateError || !updatedMeme) {
      console.error('Meme update error:', updateError?.message || 'No updated meme data');
      throw new Error(`Meme update failed: ${updateError?.message || 'Unknown error'}`);
    }

    console.log('Emitting newBid:', { meme_id: normalized_meme_id, credits, user_id });
    req.io.emit('newBid', { meme_id: normalized_meme_id, credits, user_id });
    res.status(201).json(bid);
  } catch (error) {
    console.error('Place bid error:', error.message);
    res.status(500).json({ error: 'Failed to place bid', details: error.message });
  }
};

const getBids = async (req, res) => {
  const { meme_id } = req.params;

  console.log('Fetching bids for:', { meme_id });

  try {
    const normalized_meme_id = meme_id.toLowerCase();
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('meme_id', normalized_meme_id)
      .order('credits', { ascending: false });

    if (error) {
      console.error('Get bids error:', error.message);
      throw new Error(`Get bids failed: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Get bids error:', error.message);
    res.status(500).json({ error: 'Failed to fetch bids', details: error.message });
  }
};

module.exports = { placeBid, getBids };