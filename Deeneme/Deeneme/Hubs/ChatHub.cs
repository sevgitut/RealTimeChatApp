using Deeneme.Dtos;
using Microsoft.AspNetCore.SignalR;

namespace Deeneme.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly object _usersLock = new object();
        private static List<string> _users = new List<string>();

        private static readonly object _messagesLock = new object();
        private static List<Message> messages = new List<Message>();

        public async Task<List<string>> GetAllUsersAsync()
        {
            lock (_usersLock)
            {
                return _users;
            }
        }

        public Task AddUserAsync(string name)
        {
            lock (_usersLock)
            {
                _users.Add(name);
            }
            return Clients.All.SendAsync("UserAdded", name);
        }

        public Task DeleteUser(string name)
        {
            lock (_usersLock)
            {
                _users.Remove(name);
            }
            return Clients.All.SendAsync("UserDeleted", name);
        }

        public async Task<List<Message>> GetMessageList()
        {
            lock (_messagesLock)
            {
                return new List<Message>(messages);
            }
        }

        public async Task AddMessage(Message message)
        {
            lock (_messagesLock)
            {
                messages.Add(message);
            }
            await Clients.All.SendAsync("MessageAdded", message);
        }
    }
}
