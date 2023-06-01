using Microsoft.AspNetCore.SignalR;


namespace Battleship_SignalR_Websockets.Hubs
{
    public class GameHub : Hub
    {
        private static Dictionary<string, string> playerConnections = new Dictionary<string, string>();
        private static List<string> lobbyPlayers = new List<string>();
        


        public async Task Movements(string user, int x, int y)
        {
            Console.WriteLine($"Movement from {user} to {x},{y}");
            await Clients.All.SendAsync("ReceiveMovement", user, x, y);
        }

        public async Task Attack(string opponent, int x, int y)
        {   
            Console.WriteLine($"Attack from {Context.ConnectionId} to {opponent} at {x},{y}");
            await Clients.Client(opponent).SendAsync("ReceiveAttack",x, y);
        }

        public async Task Notification(string user, string message)
        {
            Console.WriteLine($"Notification to {user} says {message}");
            await Clients.Client(user).SendAsync("ReceiveNotification", message);
        }
        public async Task RemoveTurn(string user)
        {
            Console.WriteLine($"Remove turn to {user}");
            await Clients.Client(user).SendAsync("RemoveTurn");
        }
        public async Task EndGame(string player1, string player2)
        {
            Console.WriteLine($"Game ended between {player1} and {player2}");
            await Clients.Clients(player1, player2).SendAsync("EndGame");
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            
            if (lobbyPlayers.Count < 2)
            {
                // añadir jugador a la lobby
                string playerId = Context.ConnectionId;
                lobbyPlayers.Add(playerId);
                playerConnections[playerId] = playerId;
                Console.WriteLine($"player {playerId} connected to the lobby");
                await Clients.All.SendAsync("PlayerConnected", playerId);
                
                if (lobbyPlayers.Count == 2)
                {
                    // Empezar la partida
                    string player1 = lobbyPlayers[0];
                    string player2 = lobbyPlayers[1];
                    lobbyPlayers.Clear();
                    await Clients.Client(player1).SendAsync("FirstTurn");
                    Console.WriteLine($"starting game between {player1} and {player2}");
                    await Clients.Client(player1).SendAsync("StartGame", player1, player2);
                    await Clients.Client(player2).SendAsync("StartGame", player2, player1);
                }
            }
            else
            {
                // Añadir jugadores a una lobby diferente
                string playerId = Context.ConnectionId;
                lobbyPlayers.Add(playerId);
                playerConnections[playerId] = playerId;
                Console.WriteLine($"player {playerId} connected to a new lobby");

                await Clients.All.SendAsync("PlayerConnectedToLobby", playerId);
            }
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
               

                if (lobbyPlayers.Contains(playerId))
                {
                    lobbyPlayers.Remove(playerId);
                }
            }
        }
    }
}
