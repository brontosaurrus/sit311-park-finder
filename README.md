This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Introduction

The purpose of this project was to develop an online application which could be used to find and monitor parking bays around Melbourne.  The requirements were that it should be intuitive to use and easy to understand.

As such the user has the ability to search for specific locations and be presented with 10 parking bays.  This will intially be all parking types set within a radius of 500m of the searched location centre.  However, the user can freely change the status and radius to refine their search requirements.

## API's Used

### `Map`

The map is generated through [pigeon-maps](https://github.com/mariusandra/pigeon-maps).  This allows the user to see where parking bays are located.

### `Weather`

The weather api associated with this project uses [OpenWeather](https://openweathermap.org/). This allows the user to find what the expected weather is at their desired location.  This helps in understanding if they should seek shelter or not based on these events.

### `Parking Bay`

The parking information requires information from two locations provided by City of Melbourne.  This includes the [On Street Parking Sensors](https://data.melbourne.vic.gov.au/Transport-Movement/On-street-Parking-Bay-Sensors/vh2v-4nfs) used to see if a parking space is available and the [On Street Parking Restrictions](https://data.melbourne.vic.gov.au/Transport-Movement/On-street-Car-Park-Bay-Restrictions/ntht-5rk7) to see what restrictions are associated with the parking.

This information can then be accessed by the user by viewing the map.  The map shows the markers in either green or blue depending on if the space is available or occupied. The user can also hover over the markers to view the bay id information or click on it to see all relevant data.

### `Search Bar`

The autocomplete search bar is powered by [Algolia Places](https://community.algolia.com/places/).  This allows the user to easily find their desired location and gather information as easily as possible.

## Launch App

### `React`

Go to the main folder and run **npm start**

### `AWS IOT Devices`

In the main folder go to "src\parking" and run **node ./index.js**.  This will beign an express node which will listen for any data sent by the React app regarding the parking bays which the usr wishes to be monitored.

These IOT devices will then check the status of the parking bays to see if they have changed.  IF so, they will send an MQTT message to AWS IOT with the relevant information, such as the bay_ID, status and restrictions.

## Use

Once the React App and the Express Node are active the user is able to search for a specific location using the Search Bar.  The user will then be shown the top 10 parking bays in that area.  If the user wishes to only see the available parking bays, simply use the Status drop down menu below the map and select **Unoccupied**.

The user is also able to limit the search distance from their desired location using the scroll bar at the top of the screen.  Simply click anywhere along the bar (left = 0, right = 1000) to either maximise or minise your search area.

By clicking on any of the markers the restrictions associated with the parking spot are displayed above the map.  This is useful information to see if they are able to park there.

Finally, once the user is happy with their selection press the **Start Bay Monitoring** Button above the map.  This will send information to remote devices which will track the bays and alert the user if the status changes. 