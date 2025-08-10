import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const users = await sql`
      SELECT u.*, h.name as hostel_name 
      FROM users u 
      LEFT JOIN hostels h ON u.hostel_id = h.id 
      WHERE u.email = ${email}
    `;

    if (users.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // In a real app, you'd verify the password hash here
    // For demo purposes, we'll accept any password
    
    // Return user data without password
    const { password_hash, ...userData } = user;
    
    return Response.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}