using Microsoft.AspNetCore.SignalR;

namespace Battleship_SignalR_Websockets
{
    public class GameHub : Hub
    {
        public async Task Movements(int x, int y)
        {
            await Clients.All.SendAsync()
        }
    }
}
