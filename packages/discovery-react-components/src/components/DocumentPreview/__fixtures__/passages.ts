const passages = {
  single: {
    passage_text: '5.21 Miscellaneous Costs',
    start_offset: 39611,
    end_offset: 39635,
    field: 'text'
  },
  multiline: {
    passage_text: `32.7 Buyer’s and Customer's Regulatory Authorities shall have the benefit of any rights of audit and access to information and documentation provided for in this Agreement to the extent that they relate to the exercise of the Regulatory Authorities' legal rights and/or responsibilities.  33.0 Not used 34.0 Benchmarking If: a) Buyer wishes to carry out any benchmarking exercises in respect of the Services and/or Deliverables ; and`,
    start_offset: 138812,
    end_offset: 139245,
    field: 'text'
  },
  answer: {
    passage_text:
      'You can use the <em>Smart</em> <em>Document</em> <em>Understanding</em> tool to teach Discovery about sections in your <em>documents</em> with distinct format and structure that you want Discovery to index. You can define a new field, and then annotate <em>documents</em> to train Discovery to <em>understand</em> what type of information is typically stored in the field. For more information, see Using <em>Smart</em> <em>Document</em> <em>Understanding</em>.',
    start_offset: 7487,
    end_offset: 7867,
    field: 'answer'
  }
};

export default passages;
