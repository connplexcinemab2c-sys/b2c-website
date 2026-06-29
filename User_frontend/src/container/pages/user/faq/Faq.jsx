import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function Faq() {
  const [expanded, setExpanded] = useState("panel0");
  const [faqList, setFaqList] = useState([]);
  useEffect(() => {
    getFaqdata();
  }, []);
  const getFaqdata = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_FAQS).then((res) => {
      if (res?.status === 200) {
        setFaqList(res?.data);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };
  const handleExpanded = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Index.Box className="main-faq">
      <Index.Box className="cus-container">
        <Index.Box className="faq-header">
          <Index.Typography
            variant="h1"
            component="h1"
            className="faq-header-title"
          >
            FAQ
          </Index.Typography>
        </Index.Box>
        <Index.Box className="faq-body">
          {faqList?.length > 0 ? (
            faqList?.map((item, key) => (
              <Index.Accordion
                expanded={expanded === `panel${key}`}
                onChange={handleExpanded(`panel${key}`)}
                key={key}
                className="faq-item"
              >
                <Index.AccordionSummary
                  expandIcon={<Index.ExpandMoreIcon />}
                  aria-controls={`panel${key}a-content`}
                  id={`panel${key}a-header`}
                >
                  <Index.Typography className="faq-title" variant="h4">
                    {key + 1}. {item.question}
                  </Index.Typography>
                </Index.AccordionSummary>
                <Index.AccordionDetails>
                  <Index.Typography
                    className="faq-content"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </Index.AccordionDetails>
              </Index.Accordion>
            ))
          ) : (
            <>
              <Index.Box className="no-content-box">
                <Index.Typography className="no-content-text">
                  No Content Available
                </Index.Typography>
              </Index.Box>
            </>
          )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Faq;
