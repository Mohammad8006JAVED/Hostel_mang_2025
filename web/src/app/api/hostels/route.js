import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const hostels = await sql`
      SELECT h.*, u.name as warden_name, 
             COUNT(DISTINCT users.id) as total_students,
             COUNT(DISTINCT rooms.id) as total_rooms
      FROM hostels h
      LEFT JOIN users u ON h.warden_id = u.id
      LEFT JOIN users ON users.hostel_id = h.id AND users.role = 'student'
      LEFT JOIN rooms ON rooms.hostel_id = h.id
      GROUP BY h.id, u.name
      ORDER BY h.name
    `;
    
    return Response.json({ hostels });

  } catch (error) {
    console.error('Get hostels error:', error);
    return Response.json({ error: 'Failed to fetch hostels' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, address, capacity, wardenId } = await request.json();

    if (!name || !capacity) {
      return Response.json({ error: 'Name and capacity are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO hostels (name, address, capacity, warden_id)
      VALUES (${name}, ${address}, ${capacity}, ${wardenId})
      RETURNING *
    `;

    return Response.json({ hostel: result[0] });

  } catch (error) {
    console.error('Create hostel error:', error);
    return Response.json({ error: 'Failed to create hostel' }, { status: 500 });
  }
}