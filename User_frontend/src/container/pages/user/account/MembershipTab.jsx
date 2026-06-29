import React from 'react'
import Index from '../../../Index';

function MembershipTab() {

    return (
        <Index.Box className="account-tab-membership">
            <Index.Box className="account-tab-heading-box">
                <Index.Typography component="span" className="account-tab-heading">
                    Membership
                </Index.Typography>
            </Index.Box>
            <Index.Box className="no-found-svg-box">
                <Index.LoyaltyIcon />
                You don't seem to have any recent Membership.
            </Index.Box>
        </Index.Box>
    )
}

export default MembershipTab