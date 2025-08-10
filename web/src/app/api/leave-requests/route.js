import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const hostelId = searchParams.get('hostelId');

    let query = `
      SELECT lr.*, u.name as user_name, u.student_id, u.room_no,
             h.name as hostel_name, a.name as approved_by_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN hostels h ON u.hostel_id = h.id
      LEFT JOIN users a ON lr.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      query += ` AND lr.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (status) {
      paramCount++;
      query += ` AND lr.status = $${paramCount}`;
      params.push(status);
    }

    if (hostelId) {
      paramCount++;
      query += ` AND u.hostel_id = $${paramCount}`;
      params.push(hostelId);
    }

    query += ` ORDER BY lr.created_at DESC`;

    const leaveRequests = await sql(query, params);
    
    return Response.json({ leaveRequests });

  } catch (error) {
    console.error('Get leave requests error:', error);
    return Response.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, startDate, endDate, reason, leaveType } = await request.json();

    if (!userId || !startDate || !endDate || !reason) {
      return Response.json({ error: 'User ID, dates, and reason are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO leave_requests (user_id, start_date, end_date, reason, leave_type)
      VALUES (${userId}, ${startDate}, ${endDate}, ${reason}, ${leaveType || 'personal'})
      RETURNING *
    `;

    return Response.json({ leaveRequest: result[0] });

  } catch (error) {
    console.error('Create leave request error:', error);
    return Response.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status, approvedBy } = await request.json();

    if (!id || !status) {
      return Response.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE leave_requests 
      SET status = ${status}, approved_by = ${approvedBy}, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Leave request not found' }, { status: 404 });
    }

    return Response.json({ leaveRequest: result[0] });

  } catch (error) {
    console.error('Update leave request error:', error);
    return Response.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}