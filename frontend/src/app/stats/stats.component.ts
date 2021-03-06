import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api.service';
import { TableComponent } from '../table/table.component';
import * as moment from 'moment';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
//primeng
import {DropdownModule} from 'primeng/dropdown';
import {SelectItem} from 'primeng/api';
import {BlockUIModule} from 'primeng/blockui';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {Message} from 'primeng/api';
import {PanelModule} from 'primeng/panel';
import {ChartModule} from 'primeng/chart';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})

export class StatsComponent implements OnInit {
	//general
	public countData;
	public timeSeriesData;
	loadingAll: boolean;
	loadingChart: boolean;

	//intent chart
	countDataIntentChart: any;
	intentOptions: any;
	intentNames: any;
	intentCounts: any;

	//category chart
	countDataCategoryChart: any;
	categoryOptions: any;
	categoryNames: any;
	categoryCounts: any;

	//time series chart
	timeSeriesChart: any;
	timeSeriesOptions: any = "";
	timeSeriesTimestamps: any;
	timeSeriesHits: any;
	timeSeriesDropdownTemp: any[] = [];
	timeSeriesDropdown: SelectItem[] = [];
	timeSeriesChosen: any;
	tagNames: any;

	msgs: Message[] = [];
	constructor(private _apiService: ApiService) {}

	ngOnInit() {
		this.createDropdown();
		this.createDoughnutCharts();
	}	

	//create dropdown for time series
	createDropdown(){
		//subcribe to getOnlyNames to create dropdown for time series
		this.getOnlyNames().subscribe(_ => {;
			if(this.tagNames.tags == "null"){
				this.msgs.push({severity:'error', summary:'Error!', detail:'No Tags Found!'});
			}
			else{
				this.timeSeriesDropdownTemp = this.tagNames.tags.map(data => data.name);
				for(let name of this.timeSeriesDropdownTemp){
					this.timeSeriesDropdown.push({label: name, value: name});
				}
			}	
		});
	}

	//subcribe to data and create charts
	createDoughnutCharts(){
		//subscribe to getCounts and plot doughnut charts
		this.getCounts().subscribe(_ => {;
			this.loadingAll = false;
			if(this.countData.counts == "unknown"){
				this.msgs.push({severity:'error', summary:'Error!', detail:'No Data Found!'});
			}
			else{
				//map intentions and counts
				this.intentNames = this.countData.counts.intention.map(data => data.name);
				this.intentCounts = this.countData.counts.intention.map(data => data.count);

				//map category names and counts
				this.categoryNames = this.countData.counts.category.map(data => data.name);
				this.categoryCounts = this.countData.counts.category.map(data => data.count);


				//intention chart setup
				this.countDataIntentChart = {
					labels: this.intentNames,
					datasets: [
						{
							data: this.intentCounts,
							backgroundColor: [
								"#FF6384",
								"#36A2EB",
								"#FFCE56"
							],
							hoverBackgroundColor: [
								"#FF6384",
								"#36A2EB",
								"#FFCE56"
							],
							hoverBorderColor:[
								"#241E1E",
								"#241E1E",
								"#241E1E"
							]
						}]    
					};
				//intention options
				this.intentOptions = {
					title: {
						display: true,
						text: 'Intentions',
						fontSize: 16,
						fontColor: 'white'
					},
					legend: {
						labels: {fontColor: 'white'},
						position: 'right'
					}
				};
				//category chart 
				this.countDataCategoryChart = {

					labels: this.categoryNames,
					datasets: [
						{
							data: this.categoryCounts,
							backgroundColor: [
								"#24b34e",
								"#dfa719",
								"#d11143",   
								"#93542d",
								"#00a7cc",
								"#722fa3",
								"#FF6384"
							],
							hoverBackgroundColor: [
								"#24b34e",
								"#dfa719",
								"#d11143",
								"#93542d",
								"#00a7cc",
								"#722fa3",
								"#FF6384"
							],
							hoverBorderColor:[
								"#241E1E",
								"#241E1E",
								"#241E1E",
								"#241E1E",
								"#241E1E",
								"#241E1E",
								"#241E1E"
							]
						}]    
					};
				//category options
				this.categoryOptions = {
					title: {
						display: true,
						text: 'Categories',
						fontSize: 16,
						fontColor: 'white'
					},
					legend: {
						labels: {fontColor: 'white'},
						position: 'right'
					}
				};
			}
		});	
	}

	//get only tag names (used to view time series based on tag selection)
	getOnlyNames(){
		return this._apiService
			.getOnlyNames()
			.map(
				(data) => {
					this.tagNames = data;
			})
			.catch((error) => {
				return Observable.empty();
			});
	}

	//get counts for intentions and categories (used to create doughnut charts)
	getCounts(){
		this.loadingAll = true;
		return this._apiService
			.getCounts()
			.map(
				(data) => {
					this.countData = data;
			})
			.catch((error) => {
				this.msgs.push({severity:'error', summary:'Error', detail:'Something went wrong!'});
				this.loadingAll = false;
				return Observable.empty();
			});
	}

	//used to get time series data for a selected tag
	getTimeSeries(tagName){
		this.loadingChart = true;
		return this._apiService
			.getTimeSeries(tagName)
			.map(
				(data) => {
					this.timeSeriesData = data;
			})
			.catch((error) => {
				this.msgs.push({severity:'error', summary:'Error', detail:'Something went wrong!'});
				return Observable.empty();
			});
	}
	
	//when a tag is selected, change time series chart
	tagChange(value){
		
		this.timeSeriesChosen = value;

		this.getTimeSeries(this.timeSeriesChosen).subscribe(_ => {;
    		this.loadingChart = false;
			//get timestamps 
			this.timeSeriesTimestamps = this.timeSeriesData.map(data => moment(data.timestamp).format('MM/DD/YYYY'));

			//get counts
			this.timeSeriesHits = this.timeSeriesData.map(data => data.hits);
			
			//time series chart setup
			this.timeSeriesChart = {

	            labels: this.timeSeriesTimestamps,
	            datasets: [
	                {
	                	label: this.timeSeriesChosen + ' count',
	                    data: this.timeSeriesHits,
	                   	fill: false,
                    	borderColor: 'white'
	                }]    
	            };
	       
	        //time series chart options
	        this.timeSeriesOptions = {
				title: {
				    display: true,
				    text: 'Time Series',
				    fontSize: 16,
				    fontColor: 'white'
				},
				legend: {
					labels: {fontColor: 'white'},
				    position: 'bottom'
				},
				scales: {
		            xAxes: [{ 
		                ticks: {
		                  fontColor: "white",
		                },
		                gridLines: {
						  color: "#8b8b8b"
						}
		            }],
		            yAxes: [{
		                ticks: {
		                  fontColor: "white",
		                },
		                gridLines: {
						  color: "#8b8b8b"
						}
		            }],
		        }
			};
    	});	
	}
}
