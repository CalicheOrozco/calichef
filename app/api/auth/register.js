import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { name, email, password, languagePreferences } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  try {
    await connectDB();

    const existingUser = await User.findOne({ email: lowerCaseEmail });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email: lowerCaseEmail,
      password,
      languagePreferences,
    });

    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, favorites: user.favorites } });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}