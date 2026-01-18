import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';
  
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  
  currentUser: User | null = null;
  userToDelete: User | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    
    const stored = localStorage.getItem('registeredUsers');
    if (stored) {
      try {
        const parsedUsers = JSON.parse(stored);
        console.log('👥 Users loaded from localStorage:', parsedUsers.length);
        
        
        this.users = parsedUsers.map((u: any) => ({
          ...u,
          isActive: u.isActive !== undefined ? u.isActive : true,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined
        }));
        
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error('Error parsing users:', error);
        this.users = [];
        this.filteredUsers = [];
      }
    } else {
      console.log('⚠️ No users in localStorage');
      this.users = [];
      this.filteredUsers = [];
    }
  }

  filterUsers(): void {
    let filtered = [...this.users];

    if (this.searchTerm) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
  }

  onSearch(): void {
    this.filterUsers();
  }

  onRoleChange(): void {
    this.filterUsers();
  }

  openEditModal(user: User): void {
    this.currentUser = { ...user };
    this.showEditModal = true;
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.currentUser = null;
    this.userToDelete = null;
  }

  saveUser(): void {
    if (this.currentUser) {
      const index = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.currentUser };
        this.saveToStorage();
        this.filterUsers();
        this.closeModals();
      }
    }
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
      this.saveToStorage();
      this.filterUsers();
      this.closeModals();
    }
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    this.saveToStorage();
  }

  saveToStorage(): void {
   
    localStorage.setItem('registeredUsers', JSON.stringify(this.users));
    console.log('💾 Users saved to localStorage');
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }
}