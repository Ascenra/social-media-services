const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    if (!process.env.STRIPE_TEST_KEY) {
      throw new Error('STRIPE_TEST_KEY is not configured');
    }

    const { session_id } = JSON.parse(event.body);
    
    if (!session_id) {
      throw new Error('Session ID is required');
    }

    // Retrieve the session with line items and payment intent
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent']
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(session)
    };
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        type: error.type || 'UnknownError'
      })
    };
  }
};