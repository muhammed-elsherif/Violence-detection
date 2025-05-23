import { Component, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ServiceService } from "../../core/services/service.service";
import { TechnologyComponent } from "../technology/technology.component";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Component({
  selector: "app-services",
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TechnologyComponent],
  templateUrl: "./services.component.html",
  styleUrl: "./services.component.scss",
})
export class ServicesComponent implements OnInit {
  searchQuery: string = "";
  selectedFilter: string = "";
  models: Service[] = [];
  filteredModels: Service[] = [];
  showOverlay: boolean = false;
  selectedModel: Service | null = null;
  categories: string[] = [];
  isLoggedIn: boolean = true;
  constructor(private serviceService: ServiceService, private router: Router) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getAllServices().subscribe({
      next: (services: Service[]) => {
        this.models = services;
        this.filteredModels = services;
        // Extract unique categories from services
        this.categories = [...new Set(services.map(service => service.category))];
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.target.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredModels = this.models.filter(model => {
      const matchesFilter = !this.selectedFilter || model.category === this.selectedFilter;
      const matchesSearch = !this.searchQuery || 
        model.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  openOverlay(model: Service) {
    this.selectedModel = model;
    this.showOverlay = true;
  }

  closeOverlay() {
    this.showOverlay = false;
    this.selectedModel = null;
  }

  login() {
    this.router.navigate(["/login"]);
  }
}
