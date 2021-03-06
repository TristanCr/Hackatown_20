import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from './recipe';
import { HttpClient } from '@angular/common/http';
import { Product } from './product';
const URLFIRSTPART = 'https://api.edamam.com/search?q=';
const URLSECONDPART = '&app_id=a75732ea&app_key=a7f69a13f95037e6c8cbe8840b5d7a99';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  private temperature: number;
  private doorIsOpen: boolean;
  private date: Date;
  private humidity: number;
  private productArray: Product[];
  private productToCookArray: Product[];
  @Input() newProductName: string;
  @Input() newProductExpirationDate: Date;
  private recipeArray: Recipe[];
  private viewProducts: number;
  private viewRecipe: number;
  protected stringProducts: string[];
  protected stringRecipe: string[];
  protected stringButton: string[];
  protected colors: string[];
  constructor(private http: HttpClient) {
    setInterval(() => {
      this.date = new Date();
    }, 1000);
    this.recipeArray = new Array();
    this.productArray = new Array();
    this.productToCookArray = new Array();
    this.viewProducts = 0;
    this.viewRecipe = 0;
    this.stringProducts = new Array();
    this.stringProducts.push('Display products');
    this.stringProducts.push('Hide products');
    this.stringRecipe = new Array();
    this.stringRecipe.push('Display recipes');
    this.stringRecipe.push('Hide recipes');
    this.stringButton = new Array();
    this.stringButton.push('Add');
    this.stringButton.push('Added');
    this.colors = new Array();
    this.colors.push('rgba(255, 0, 0, 0.5)');
    this.colors.push('rgba(245, 171, 53, 1)');
    this.colors.push('rgba(0, 255, 0, 0.5)');
  }
  ngOnInit() {
    setInterval(() => {
      this.http.get('http://localhost:5000').subscribe((response: any) => {
        for (let i = 0; i < 3; i++) {
          if ((response[i] as string).includes('H')) {
            this.humidity = Number((response[i] as string).split('-')[1]);
          }
          if ((response[i] as string).includes('T')) {
            this.temperature = Number((response[i] as string).split('-')[1]);
          }
          if ((response[i] as string).includes('D')) {
            this.doorIsOpen = Number((response[i] as string).split('-')[1]) !== 0;
          }
        }
      });
    }, 3000);
  }

  goToRecipe(url: string) {
    window.open(url, '_blank');
  }

  addProduct() {
    this.productArray.push({
      name: this.newProductName,
      expirationDate: this.newProductExpirationDate,
      isAdded: false,
    });
    this.newProductName = '';
  }

  changeProduct() {
    this.viewProducts = this.viewProducts === 0 ? 1 : 0;
  }

  changeButton(index: number) {
    if (this.productArray[index].isAdded) {
      this.productToCookArray.splice(this.productToCookArray.indexOf(this.productArray[index]), 1);
      this.productArray[index].isAdded = false;
    } else {
      this.productToCookArray.push(this.productArray[index]);
      this.productArray[index].isAdded = true;
    }
    this.findRecipe();
  }

  remove(index: number) {
    this.productArray.splice(index, 1);
  }

  changeRecipe() {
    this.viewRecipe = this.viewRecipe === 0 ? 1 : 0;
    this.findRecipe();
  }

  calculateTimeLeft(index: number): any {
    const date1 = new Date (this.productArray[index].expirationDate);
    const date2 = new Date();
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  productsToString(): string {
    let stringProducts = this.productToCookArray[0].name;
    for (let index = 1; index < this.productToCookArray.length; index++) {
      stringProducts += '+' + this.productToCookArray[index];
    }
    return stringProducts;
  }
  findRecipe() {
    // tslint:disable-next-line:max-line-length
    this.http.get(URLFIRSTPART + this.productsToString() + URLSECONDPART)
      .subscribe((response: any) => {
        console.log(response);
        this.recipeArray = [];
        for (const currentRecipe of response.hits) {
          this.recipeArray.push( {
            nom: currentRecipe.recipe.label,
            image: currentRecipe.recipe.image,
            url: currentRecipe.recipe.url
          });
        }
        // response.hits[0]
        console.log(this.recipeArray);
      });
  }

  checkTemp(): number {
    let tempState: number;
    if (this.temperature < 1 || this.temperature > 5) {
      tempState = 0;
    } else if ( this.temperature === 1 || this.temperature === 5) {
      tempState = 1;
    } else {
      tempState = 2;
    }
    return tempState;
  }

  checkHumidity(): number {
    let humidityState: number;
    if (this.humidity < 25 || this.humidity > 40) {
      humidityState = 0;
    } else if (this.humidity < 28 || this.humidity > 37) {
      humidityState = 1;
    } else {
      humidityState = 2;
    }
    return humidityState;
  }
}
