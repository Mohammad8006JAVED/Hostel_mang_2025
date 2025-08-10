import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const hostelId = searchParams.get('hostelId');
    const status = searchParams.get('status');

    let query = `
      SELECT a.*, u.name as user_name, u.student_id, u.room_no, 
             h.name as hostel_name, m.name as marked_by_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN hostels h ON u.hostel_id = h.id
      LEFT JOIN users m ON a.marked_by = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      query += ` AND a.date = $${paramCount}`;
      params.push(date);
    }

    if (userId) {
      paramCount++;
      query += ` AND a.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (hostelId) {
      paramCount++;
      query += ` AND u.hostel_id = $${paramCount}`;
      params.push(hostelId);
    }

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY a.date DESC, u.name`;

    const attendance = await sql(query, params);
    
    return Response.json({ attendance });

  } catch (error) {
    console.error('Get attendance error:', error);
    return Response.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, date, status, markedBy, notes } = await request.json();

    if (!userId || !date || !status) {
      return Response.json({ error: 'User ID, date, and status are required' }, { status: 400 });
    }

    // Check if attendance already exists for this user and date
    const existing = await sql`
      SELECT id FROM attendance WHERE user_id = ${userId} AND date = ${date}
    `;

    if (existing.length > 0) {
      // Update existing attendance
      const result = await sql`
        UPDATE attendance 
        SET status = ${status}, marked_by = ${markedBy}, notes = ${notes}, marked_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND date = ${date}
        RETURNING *
      `;
      return Response.json({ attendance: result[0] });
    } else {
      // Create new attendance record
      const result = await sql`
        INSERT INTO attendance (user_id, date, status, marked_by, notes)
        VALUES (${userId}, ${date}, ${status}, ${markedBy}, ${notes})
        RETURNING *
      `;
      return Response.json({ attendance: result[0] });
    }

  } catch (error) {
    console.error('Mark attendance error:', error);
    return Response.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}