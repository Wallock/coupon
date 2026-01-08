import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pid, couponCode } = body

    if (!pid || !couponCode) {
      return NextResponse.json(
        { error: 'Missing required fields: pid or couponCode' },
        { status: 400 }
      )
    }

    // Call the external API
    const apiUrl = `https://coupon.netmarble.com/api/coupon/reward?gameCode=tskgb&couponCode=${encodeURIComponent(
      couponCode
    )}&langCd=EN_US&pid=${encodeURIComponent(pid)}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    // If GET request was successful (errorCode: 200), send POST request to confirm
    if (data.errorCode === 200 && data.success) {
      try {
        const postResponse = await fetch('https://coupon.netmarble.com/api/coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            gameCode: 'tskgb',
            couponCode: couponCode,
            langCd: 'EN_US',
            pid: pid,
          }),
        })

        const postData = await postResponse.json()

        // Return combined response with POST confirmation
        return NextResponse.json({
          ...data,
          confirmed: postData.success || false,
          confirmErrorCode: postData.errorCode,
          confirmErrorMessage: postData.errorMessage,
          confirmResultData: postData.resultData,
        })
      } catch (postError) {
        console.error('Error in POST confirmation:', postError)
        // Still return the GET response even if POST fails
        return NextResponse.json({
          ...data,
          confirmed: false,
          confirmError: 'Failed to confirm coupon redemption',
        })
      }
    }

    // Return the response from the GET API if not successful
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in redeem API:', error)
    return NextResponse.json(
      {
        errorCode: -1,
        errorMessage: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}
