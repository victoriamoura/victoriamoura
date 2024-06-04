import React, { useState, useEffect } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState({})

  //Strava Credentials
  let clientID = "127877";
  let clientSecret = "537ebbe618ba01a80434eaa118a6747256618153";

  // refresh token and call address
  const refreshToken = "ebba9f56eaee614e0127140dddf3d6e568ba24d5";
  const callRefresh = `https://www.strava.com/oauth/token?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
  
  // endpoint for read-all activities. temporary token is added in getActivities()
  const callActivities = `https://www.strava.com/api/v3/athlete/activities?access_token=`

  // Use refresh token to get current access token
  useEffect(() => {
    fetch(callRefresh, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(result => getActivities(result.access_token))
  }, [callRefresh])

  // use current access token to call all activities
  function getActivities(access){
    // console.log("access: ", access)
    fetch(callActivities + access)
      .then(res => res.json())
      .then(data => setActivities(data), setIsLoading(prev => !prev))
      .catch(e => console.log(e))
  }

  function showActivities(){
    if(isLoading) return <>LOADING</>
    if(!isLoading) {
      console.log(activities)
      return activities.length
    }
  }

  return (
    <div className="App">
      {showActivities()}
    </div>
  );
}

export default App;