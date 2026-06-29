import React from 'react'
import Index from '../../../Index';

function SupportTab() {

    return (
        <Index.Box className="account-tab-support">
            <Index.Box className="account-tab-heading-box">
                <Index.Typography component="span" className="account-tab-heading">
                    Help & Support
                </Index.Typography>
            </Index.Box>
            <Index.Box className="no-found-svg-box">
                <Index.PrivacyTipIcon />
                No Data Available
            </Index.Box>
        </Index.Box>
    )
}

export default SupportTab