const supabase = require('../config/db');
const { generateCaption, generateVibe } = require('../utils/gemini');

const createMeme = async (req, res) => {
  const { title, image_url, tags } = req.body;
  const user_id = req.user.id;
  const defaultImage = image_url || 'https://picsum.photos/200';
  
  try {
    console.log('Creating meme with:', { title, image_url: defaultImage, tags, user_id });
    const caption = await generateCaption(tags);
    const vibe = await generateVibe(tags);
    console.log('Generated:', { caption, vibe });
    if (!caption || !vibe) {
      console.error('Null caption or vibe detected');
      throw new Error('Failed to generate caption or vibe');
    }
    
    const { data, error } = await supabase
      .from('memes')
      .insert([{ title, image_url: defaultImage, tags, upvotes: 0, owner_id: user_id, caption, vibe }])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Meme created:', data);
    req.io.emit('newMeme', data);
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Create meme error:', error.message);
    res.status(500).json({ error: 'Failed to create meme' });
  }
};

const voteMeme = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user_id = req.user.id;

  try {
    // Check if user already voted (simple deduplication)
    const { data: existingVote, error: voteError } = await supabase
      .from('votes')
      .select('id')
      .eq('meme_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'User already voted' });
    }

    const { data: meme, error } = await supabase
      .from('memes')
      .select('upvotes')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const newUpvotes = type === 'up' ? meme.upvotes + 1 : meme.upvotes - 1;
    
    const { data, error: updateError } = await supabase
      .from('memes')
      .update({ upvotes: newUpvotes })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;

    // Record vote
    await supabase
      .from('votes')
      .insert([{ meme_id: id, user_id, vote_type: type }]);
    
    req.io.emit('voteUpdate', { id, upvotes: newUpvotes });
    
    res.json(data);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
};

const getLeaderboard = async (req, res) => {
  const { top = 10 } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(top);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const getMemes = async (req, res) => {
  const { tag } = req.query;
  try {
    let query = supabase.from('memes').select('*');
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Get memes error:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
};

module.exports = { createMeme, voteMeme, getLeaderboard, getMemes };