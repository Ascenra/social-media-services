const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters);
    const sessionId = params.get('session_id');
    const redirectUrl = params.get('redirect') || 'https://ascenrasocial.com/thank-you';

    if (!sessionId) {
      throw new Error('No session ID provided');
    }

    // Verify the payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // Payment successful, redirect to WordPress thank you page
    return {
      statusCode: 303,
      headers: {
        ...headers,
        'Location': redirectUrl
      },
      body: JSON.stringify({
        message: 'Payment successful, redirecting...'
      })
    };

  } catch (error) {
    console.error('Success handler error:', error);
    
    // Redirect to error page on WordPress site
    return {
      statusCode: 303,
      headers: {
        ...headers,
        'Location': 'https://ascenrasocial.com/payment-error'
      },
      body: JSON.stringify({ 
        error: error.message
      })
    };
  }
}; 