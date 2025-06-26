import React from 'react';

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <h1 className="text-white text-4xl">App is Working!</h1>
    </div>
  );
};

export default App;
