import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext';

const AvatarSelectPage = () => {
  const navigate = useNavigate();
  const { setSelectedAvatar } = useAvatar();

  const avatars = [
    { name: 'Sakura', image: '/avatars/girl1.png' },
    { name: 'Emily', image: '/avatars/girl2.png' },
    { name: 'Aiko', image: '/avatars/girl3.png' },
  ];

  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-10 text-center">
          Choose Your AI Girlfriend
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {avatars.map((avatar) => (
            <div
              key={avatar.name}
              onClick={() => selectAvatar(avatar)}
              className="cursor-pointer bg-white p-4 shadow-lg rounded-xl flex flex-col items-center hover:scale-105 transition-transform duration-300"
            >
              <div className="w-[200px] aspect-square rounded-full border-4 border-pink-300 bg-pink-300 p-[2px] overflow-hidden">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-700">{avatar.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectPage;
