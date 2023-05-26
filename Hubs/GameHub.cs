using Microsoft.AspNetCore.SignalR;

namespace Battleship_SignalR_Websockets.Hubs
{
    public class GameHub : Hub
    {
        private static Dictionary<string, string> playerConnections = new Dictionary<string, string>();

        public async Task Movements(string user, int x, int y)
        {
            await Clients.All.SendAsync("ReceiveMovement", user, x, y);
        }
       
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");

            if (playerConnections.ContainsKey(Context.ConnectionId))
            {
                string playerId = playerConnections[Context.ConnectionId];
                playerConnections.Remove(Context.ConnectionId);

                await Clients.All.SendAsync("PlayerDisconnected", playerId);
            }
        }

        
    }
}


