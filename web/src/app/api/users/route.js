import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const hostelId = searchParams.get('hostelId');

    let query = `
      SELECT u.*, h.name as hostel_name 
      FROM users u 
      LEFT JOIN hostels h ON u.hostel_id = h.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    if (hostelId) {
      paramCount++;
      query += ` AND u.hostel_id = $${paramCount}`;
      params.push(hostelId);
    }

    query += ` ORDER BY u.name`;

    const users = await sql(query, params);
    
    // Remove password hashes from response
    const safeUsers = users.map(({ password_hash, ...user }) => user);
    
    return Response.json({ users: safeUsers });

  } catch (error) {
    console.error('Get users error:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, role, hostelId, roomNo, phone, studentId } = await request.json();

    if (!name || !email || !password || !role) {
      return Response.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    // In a real app, you'd hash the password
    const passwordHash = password; // For demo purposes

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, hostel_id, room_no, phone, student_id)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${hostelId}, ${roomNo}, ${phone}, ${studentId})
      RETURNING id, name, email, role, hostel_id, room_no, phone, student_id, created_at
    `;

    return Response.json({ user: result[0] });

  } catch (error) {
    console.error('Create user error:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}