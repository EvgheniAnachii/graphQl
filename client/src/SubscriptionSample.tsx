import React from 'react'
import { gql } from './__generated__'
import { useSubscription } from '@apollo/client'

const SUBSCRIBE_FOR_INCREMENT = gql(`
  subscription getNotified {
    trackUpdated {
      clientField @client
      numberOfViews
    }
  }
`)

const SubscriptionSample = () => {
  const { loading, error, data } = useSubscription(SUBSCRIBE_FOR_INCREMENT)

  return (
    <>
      {loading ? (
        <div>Listening for changes...</div>
      ) : (
        <div>Number of views is: {data?.trackUpdated?.numberOfViews}</div>
      )}
    </>
  )
}

export default SubscriptionSample
