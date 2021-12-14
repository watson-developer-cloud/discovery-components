import { findMatchingBbox, bboxesIntersect } from '../box';
import { CellPage } from '../../types';
const originalDocBbox = [
  {
    page_number: 42,
    bbox: [54, 559.2470703125, 558.0707397460938, 592.3199934959412]
  },
  {
    page_number: 13,
    bbox: [54, 256.6070556640625, 558.1146850585938, 316.8000044822693]
  },
  {
    page_number: 43,
    bbox: [54, 559.2470703125, 558.0707397460938, 592.3199934959412]
  }
];

const processedDocBbox = [
  {
    left: 90,
    right: 558.0650634765625,
    top: 89.32704162597656,
    bottom: 122.40002584457397,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 52926,
      end: 53323
    }
  },
  {
    left: 54,
    right: 558.0352172851562,
    top: 140.9270782470703,
    bottom: 163.20001363754272,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 53400,
      end: 53660
    }
  },
  {
    left: 54,
    right: 558.0296020507812,
    top: 187.24708557128906,
    bottom: 222.72003316879272,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 53737,
      end: 54158
    }
  },
  {
    left: 54,
    right: 557.9866333007812,
    top: 216.0470733642578,
    bottom: 236.88000631332397,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 54235,
      end: 54455
    }
  },
  {
    left: 54,
    right: 558.1146850585938,
    top: 256.6070556640625,
    bottom: 316.8000044822693,
    page: 13,
    className: 'text css_1062862643',
    location: {
      begin: 54532,
      end: 54918
    }
  },
  {
    left: 54,
    right: 546.7134399414062,
    top: 335.8070373535156,
    bottom: 421.9199995994568,
    page: 13,
    className: 'text css_1062862643',
    location: {
      begin: 54995,
      end: 55716
    }
  },
  {
    left: 54,
    right: 553.7463989257812,
    top: 428.447021484375,
    bottom: 474.71998739242554,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 55793,
      end: 56304
    }
  },
  {
    left: 54,
    right: 557.2378540039062,
    top: 494.6870422363281,
    bottom: 554.1600203514099,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 56381,
      end: 57003
    }
  },
  {
    left: 54,
    right: 556.2339477539062,
    top: 573.8870239257812,
    bottom: 633.5999617576599,
    page: 13,
    className: 'text css_1808944156',
    location: {
      begin: 57080,
      end: 57739
    }
  },
  {
    left: 54,
    right: 524.0909423828125,
    top: 653.3270263671875,
    bottom: 699.5999617576599,
    page: 13,
    className: 'text css_1062862643',
    location: {
      begin: 57816,
      end: 58086
    }
  },
  {
    left: 54,
    right: 558.0304565429688,
    top: 89.32704162597656,
    bottom: 109.20001363754272,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 206337,
      end: 206646
    }
  },
  {
    left: 54,
    right: 558.1293334960938,
    top: 128.9270782470703,
    bottom: 281.0399947166443,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 206723,
      end: 208215
    }
  },
  {
    left: 54,
    right: 558.0005493164062,
    top: 299.5670471191406,
    bottom: 319.43998861312866,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 208292,
      end: 208635
    }
  },
  {
    left: 54,
    right: 558.1326293945312,
    top: 337.967041015625,
    bottom: 397.67997884750366,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 208712,
      end: 209376
    }
  },
  {
    left: 54,
    right: 558.0505981445312,
    top: 416.20703125,
    bottom: 436.08000326156616,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 209453,
      end: 209736
    }
  },
  {
    left: 54,
    right: 558.0557250976562,
    top: 454.6070251464844,
    bottom: 500.8799910545349,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 209813,
      end: 210397
    }
  },
  {
    left: 54,
    right: 558.0355834960938,
    top: 507.40704345703125,
    bottom: 540.4799666404724,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 210474,
      end: 210926
    }
  },
  {
    left: 54,
    right: 558.0707397460938,
    top: 559.2470703125,
    bottom: 592.3199934959412,
    page: 42,
    className: 'text css_1808944156',
    location: {
      begin: 211003,
      end: 211388
    }
  },
  {
    left: 54,
    right: 558.0707397460938,
    top: 559.2470703125,
    bottom: 592.3199934959412,
    page: 43,
    className: 'text css_1808944156',
    location: {
      begin: 211003,
      end: 211388
    }
  },
  {
    left: 54,
    right: 558.036376953125,
    top: 612.0469970703125,
    bottom: 707.5200057029724,
    page: 42,
    className: 'text css_1062862643',
    location: {
      begin: 211465,
      end: 211708
    }
  }
];

describe('box', () => {
  it('find matching bbox', () => {
    const result = [
      {
        left: 54,
        right: 558.0707397460938,
        top: 559.2470703125,
        bottom: 592.3199934959412,
        page: 42,
        className: 'text css_1808944156',
        location: {
          begin: 211003,
          end: 211388
        }
      }
    ];
    expect(findMatchingBbox(originalDocBbox[0] as CellPage, processedDocBbox)).toEqual(result);
  });

  it('find matching bbox on correct page', () => {
    const result = [
      {
        left: 54,
        right: 558.0707397460938,
        top: 559.2470703125,
        bottom: 592.3199934959412,
        page: 42,
        className: 'text css_1808944156',
        location: {
          begin: 211003,
          end: 211388
        }
      }
    ];

    const result2 = [
      {
        left: 54,
        right: 558.0707397460938,
        top: 559.2470703125,
        bottom: 592.3199934959412,
        page: 43,
        className: 'text css_1808944156',
        location: {
          begin: 211003,
          end: 211388
        }
      }
    ];

    expect(findMatchingBbox(originalDocBbox[2] as CellPage, processedDocBbox)).not.toEqual(result);
    expect(findMatchingBbox(originalDocBbox[2] as CellPage, processedDocBbox)).toEqual(result2);
  });

  it('find matching bbox where end intersection is exclusive', () => {
    const result = [
      {
        left: 54,
        right: 558.1146850585938,
        top: 256.6070556640625,
        bottom: 316.8000044822693,
        page: 13,
        className: 'text css_1062862643',
        location: {
          begin: 54532,
          end: 54918
        }
      }
    ];
    expect(findMatchingBbox(originalDocBbox[1] as CellPage, processedDocBbox)).toEqual(result);
  });

  describe('bboxesIntersect', () => {
    it('should return true when boxes intersect', () => {
      expect(bboxesIntersect([10, 10, 20, 20], [15, 15, 25, 25])).toBeTruthy();
    });

    it("should return false when boxes don't intersect", () => {
      expect(bboxesIntersect([10, 10, 20, 20], [15, 25, 25, 35])).toBeFalsy();
    });

    it('should return false when one box is on another', () => {
      expect(bboxesIntersect([10, 10, 20, 20], [20, 10, 30, 20])).toBeFalsy();
      expect(bboxesIntersect([10, 10, 20, 20], [0, 10, 10, 20])).toBeFalsy();
      expect(bboxesIntersect([10, 10, 20, 20], [10, 20, 20, 30])).toBeFalsy();
      expect(bboxesIntersect([10, 10, 20, 20], [10, 0, 20, 10])).toBeFalsy();
    });
  });
});
