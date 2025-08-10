import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const qrData = searchParams.get('qrData');

    if (qrData) {
      // Verify QR code and get user info
      const result = await sql`
        SELECT qr.*, u.name, u.student_id, u.room_no, u.role, h.name as hostel_name
        FROM qr_codes qr
        JOIN users u ON qr.user_id = u.id
        LEFT JOIN hostels h ON u.hostel_id = h.id
        WHERE qr.qr_data = ${qrData} AND qr.is_active = true
      `;

      if (result.length === 0) {
        return Response.json({ error: 'Invalid or inactive QR code' }, { status: 404 });
      }

      return Response.json({ qrCode: result[0] });
    }

    if (userId) {
      // Get QR codes for specific user
      const result = await sql`
        SELECT * FROM qr_codes WHERE user_id = ${userId} AND is_active = true
      `;
      return Response.json({ qrCodes: result });
    }

    return Response.json({ error: 'User ID or QR data required' }, { status: 400 });

  } catch (error) {
    console.error('Get QR codes error:', error);
    return Response.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate unique QR data
    const qrData = `QR_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Deactivate old QR codes for this user
    await sql`
      UPDATE qr_codes SET is_active = false WHERE user_id = ${userId}
    `;

    // Create new QR code
    const result = await sql`
      INSERT INTO qr_codes (user_id, qr_data)
      VALUES (${userId}, ${qrData})
      RETURNING *
    `;

    return Response.json({ qrCode: result[0] });

  } catch (error) {
    console.error('Generate QR code error:', error);
    return Response.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}