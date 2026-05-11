export const welcome = () => {
  const date = new Date(Date.now());
  const hours = date.getHours();
  let greeting = '';
  let emoji = '🌅';

  if (hours < 12) {
    greeting = 'Good morning! Rise and shine! 🌅';
    emoji = '☀️';
  } else if (hours < 18) {
    greeting = 'Good afternoon! Keep pushing towards your fitness goals! 💪';
    emoji = '🌤️';
  } else {
    greeting = 'Good evening! Time to refuel and recover! 🌙';
    emoji = '🌙';
  }

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FitFuelz - Welcome</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="width: 90%; max-width: 900px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); padding: 60px 40px; animation: slideInDown 0.8s ease-out; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
        <div style="text-align: center; margin-bottom: 30px; position: relative; z-index: 1;">
          <h1 style="font-size: 48px; font-weight: 700; margin: 0 0 10px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: fadeInScale 1s ease-out;">🥗 FitFuelz</h1>
          <p style="font-size: 16px; color: #888; margin: 0; font-style: italic;">Your Premier Fitness & Nutrition Backend API</p>
        </div>
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); border-radius: 15px; margin-bottom: 30px; animation: fadeIn 1.2s ease-out; position: relative; z-index: 1;">
          <p style="font-size: 28px; font-weight: 600; color: #333; margin: 0 0 10px 0;">${emoji} ${greeting}</p>
          <p style="font-size: 14px; color: #666; margin: 0;">📅 ${formattedDate}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; position: relative; z-index: 1;">
          <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center; animation: slideInLeft 0.8s ease-out; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);">
            <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
            <p style="margin: 0; font-weight: 600;">API Status</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Backend is Running</p>
          </div>
          <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: white; text-align: center; animation: slideInUp 0.8s ease-out; box-shadow: 0 5px 15px rgba(245, 87, 108, 0.2);">
            <div style="font-size: 24px; margin-bottom: 10px;">💪</div>
            <p style="margin: 0; font-weight: 600;">Performance</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Fully Optimized</p>
          </div>
          <div style="padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white; text-align: center; animation: slideInRight 0.8s ease-out; box-shadow: 0 5px 15px rgba(79, 172, 254, 0.2);">
            <div style="font-size: 24px; margin-bottom: 10px;">🚀</div>
            <p style="margin: 0; font-weight: 600;">Ready to Deploy</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Production Ready</p>
          </div>
        </div>
        <div style="padding: 25px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px; position: relative; z-index: 1;">
          <h3 style="font-size: 18px; font-weight: 700; color: #333; margin: 0 0 15px 0;">🎯 FitFuelz Features</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="font-size: 14px; color: #555;"><strong>✨</strong> User Authentication</div>
            <div style="font-size: 14px; color: #555;"><strong>📊</strong> Nutrition Tracking</div>
            <div style="font-size: 14px; color: #555;"><strong>🏋️</strong> Workout Management</div>
            <div style="font-size: 14px; color: #555;"><strong>🎖️</strong> Achievement System</div>
            <div style="font-size: 14px; color: #555;"><strong>👥</strong> Community Features</div>
            <div style="font-size: 14px; color: #555;"><strong>📱</strong> Mobile-First API</div>
          </div>
        </div>
        <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 12px; border-left: 4px solid #667eea; position: relative; z-index: 1;">
          <p style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 10px 0;">🚀 Ready to Build Something Amazing?</p>
          <p style="font-size: 13px; color: #666; margin: 0;">Start integrating with the FitFuelz API endpoints and transform your fitness journey!</p>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          div[style*="width: 90%"] { padding: 30px 20px !important; }
          h1 { font-size: 36px !important; }
          p[style*="font-size: 28px"] { font-size: 20px !important; }
        }
      </style>
    </body>
    </html>
  `;
};
