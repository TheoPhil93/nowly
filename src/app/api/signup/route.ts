import connectDB from '../../utils/db'; // Make sure this imports your DB connection
import User from '../../models/User';  // Ensure the model path is correct
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        // Validate the fields
        if (!name || !email || !password) {
            return new Response(JSON.stringify({ message: 'Alle Felder sind erforderlich.' }), { status: 400 });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new Response(JSON.stringify({ message: 'E-Mail bereits registriert.' }), { status: 400 });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in the database
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        return new Response(JSON.stringify({ message: 'Benutzer erfolgreich registriert.' }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ message: 'Fehler bei der Registrierung' }), { status: 500 });
    }
}
