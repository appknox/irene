import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export type StoreknoxFakeAppsDetailsModel = {
  id: number;
  sk_app: number;
  hooper_detection_ulid: string;
  status: number;
  status_display: string;
  package_name: string;
  title: string;
  app_url: string;
  store: {
    id: number;
    name: string;
    identifier: string;
    icon: string;
    platform: number;
    platform_display: 'android' | 'apple';
  };
  dev_name: string;
  original_app_icon_url: string;
  fake_app_icon_url: string;
  confidence_score: number;
  similarity_scores: {
    final: number;
    LogoSimilarityRule: number;
    TitleBrandAbuseRule: number;
    PackageSimilarityRule: number;
    SemanticSimilarityRule: number;
    DeveloperConsistencyRule: number;
  };
  signals: {
    fake_app: number;
    same_org: number;
    irrelevant: number;
    brand_abuse: number;
    same_category: number;
  };
  ai_scores: {
    final: number;
    LogoSimilarityRule: number;
    TitleBrandAbuseRule: number;
    PackageSimilarityRule: number;
    SemanticSimilarityRule: number;
    DeveloperConsistencyRule: number;
    AppFunctionalitySimilarityRule: number;
    LogoSimilarityRule_justification: string;
    TitleBrandAbuseRule_justification: string;
    PackageSimilarityRule_justification: string;
    SemanticSimilarityRule_justification: string;
    DeveloperConsistencyRule_justification: string;
    AppFunctionalitySimilarityRule_justification: string;
  };
  ai_confidence: number;
  ai_classification_label: string;
  ai_classification: {
    label: string;
    confidence: number;
    label_value: number;
    probabilities: {
      fake_app: number;
      same_org: number;
      irrelevant: number;
      brand_abuse: number;
      same_category: number;
    };
    ai_classification_justification: string;
  };
  ai_classification_justification: string;
  has_classification_mismatch: boolean;
  rule_breakdown: {
    LogoSimilarityRule: {
      decision: string;
      phash_score: number;
      phash_ranges: {
        weak: string;
        ignored: string;
        similar: string;
        identical: string;
        strong_reuse: string;
      };
      embedding_score: number;
      logo_similarity: number;
      scoring_formula: string;
      phash_thresholds: {
        weak_signal: number;
        strong_signal: number;
      };
      similarity_method: string;
      logo_match_percentage: number;
      phash_signal_strength: string;
      embedding_score_adjusted: number;
      original_logo_url_present: boolean;
      candidate_logo_url_present: boolean;
    };
    TitleBrandAbuseRule: {
      brand_name: string;
      brand_present: boolean;
      fake_app_signal: number;
      fake_app_reasoning: string;
      developer_similarity: number;
    };
    PackageSimilarityRule: {
      signal_level: string;
      package_similarity: number;
      original_components: {
        app: string;
        domain: string;
        company: string;
      };
      suspicious_patterns: {
        generic_company: boolean;
        different_domain: boolean;
        package_structure_mismatch: boolean;
      };
      candidate_components: {
        app: string;
        domain: string;
        company: string;
      };
    };
    SemanticSimilarityRule: {
      signal_level: string;
      cosine_similarity: number;
    };
    DeveloperConsistencyRule: {
      signal_level: string;
      developer_similarity: number;
      original_dev_normalized: string;
      candidate_dev_normalized: string;
    };
  };
  reviewed_by: string | null;
  reviewed_on: Date | null;
  ignore_reason: string;
  added_to_inventory_app: string | null;
  created_on: string;
};

export default class StoreknoxFakeAppsDetailsRoute extends AkBreadcrumbsRoute {
  model() {
    return {
      id: 126,
      sk_app: 1,
      hooper_detection_ulid: '01KJMCF70MAWKG3DGV3Q2VZQ9R',
      status: 0,
      status_display: 'PENDING',
      package_name: 'abc.sadnoxx.mediadownloader',
      title: 'Status Saver - Video Download',
      app_url:
        'https://play.google.com/store/apps/details?id=abc.sadnoxx.mediadownloader',
      store: {
        id: 1,
        name: 'PlayStore',
        identifier: 'playstore',
        icon: '',
        platform: 0,
        platform_display: 'android',
      },
      dev_name: 'NoXx',
      original_app_icon_url:
        'https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN',
      fake_app_icon_url:
        'https://play-lh.googleusercontent.com/Fld3bzSAdkMIITDwGviV5V__fxSlDdVc14RrzluCfv30PZa2Jd87Uj87QcknZevp2SmN',
      confidence_score: 0.204,
      similarity_scores: {
        final: 0.204,
        LogoSimilarityRule: 0.805968878,
        TitleBrandAbuseRule: 0.05,
        PackageSimilarityRule: 0.075,
        SemanticSimilarityRule: 0.7968869805335999,
        DeveloperConsistencyRule: 0.0,
      },
      signals: {
        fake_app: 0.004750000000000001,
        same_org: 0.06855,
        irrelevant: 0.049350000000000005,
        brand_abuse: 0.04585,
        same_category: 0.204,
      },
      ai_scores: {
        final: 0.9,
        LogoSimilarityRule: 0.805968878,
        TitleBrandAbuseRule: 0.05,
        PackageSimilarityRule: 0.075,
        SemanticSimilarityRule: 0.7968869805335999,
        DeveloperConsistencyRule: 0.0,
        AppFunctionalitySimilarityRule: 0.1,
        LogoSimilarityRule_justification:
          'The candidate app uses the identical logo image as the original app, resulting in a high similarity score (0.806) and indicating direct visual impersonation.',
        TitleBrandAbuseRule_justification:
          "The candidate app's title 'Status Saver - Video Download' does not contain the brand name 'WhatsApp', indicating no direct brand abuse in the title.",
        PackageSimilarityRule_justification:
          "The package names 'com.whatsapp' and 'abc.sadnoxx.mediadownloader' are structurally and lexically very different, resulting in low similarity.",
        SemanticSimilarityRule_justification:
          "The semantic similarity between the titles 'WhatsApp Messenger' and 'Status Saver - Video Download' is moderately high, likely due to common terms or implied context.",
        DeveloperConsistencyRule_justification:
          "The original app is developed by 'WhatsApp LLC' and the candidate by 'NoXx', indicating completely different developers.",
        AppFunctionalitySimilarityRule_justification:
          'The original app is a communication messenger, while the candidate app is a utility for saving media, indicating different core functionalities.',
      },
      ai_confidence: 0.9,
      ai_classification_label: 'fake_app',
      ai_classification: {
        label: 'fake_app',
        confidence: 0.9,
        label_value: 3,
        probabilities: {
          fake_app: 0.9,
          same_org: 0.01,
          irrelevant: 0.04,
          brand_abuse: 0.03,
          same_category: 0.02,
        },
        ai_classification_justification:
          "The candidate app uses an identical logo to the legitimate WhatsApp Messenger, strongly indicating visual impersonation. Despite having a different developer and a title that doesn't explicitly mention 'WhatsApp', its functionality as a 'Status Saver' is commonly associated with the original app, suggesting an intent to deceive users into believing it's an official or related utility.",
      },
      ai_classification_justification:
        "The candidate app uses an identical logo to the legitimate WhatsApp Messenger, strongly indicating visual impersonation. Despite having a different developer and a title that doesn't explicitly mention 'WhatsApp', its functionality as a 'Status Saver' is commonly associated with the original app, suggesting an intent to deceive users into believing it's an official or related utility.",
      has_classification_mismatch: true,
      rule_breakdown: {
        LogoSimilarityRule: {
          decision: 'similar_logo',
          phash_score: 0.7109375,
          phash_ranges: {
            weak: '0.4-0.7',
            ignored: '< 0.4',
            similar: '0.7-0.8',
            identical: '>= 0.9',
            strong_reuse: '0.8-0.9',
          },
          embedding_score: 0.86932313,
          logo_similarity: 0.805968878,
          scoring_formula: 'phash_gate(0.7) \u2192 60% embedding + 40% pHash',
          phash_thresholds: {
            weak_signal: 0.4,
            strong_signal: 0.7,
          },
          similarity_method: 'conditional_hybrid',
          logo_match_percentage: 80.6,
          phash_signal_strength: 'strong',
          embedding_score_adjusted: 0.86932313,
          original_logo_url_present: true,
          candidate_logo_url_present: true,
        },
        TitleBrandAbuseRule: {
          brand_name: 'whatsapp',
          brand_present: false,
          fake_app_signal: 0.0,
          fake_app_reasoning: 'high_risk_completely_different',
          developer_similarity: 0.0,
        },
        PackageSimilarityRule: {
          signal_level: 'very_low',
          package_similarity: 0.075,
          original_components: {
            app: '',
            domain: 'com',
            company: 'whatsapp',
          },
          suspicious_patterns: {
            generic_company: false,
            different_domain: false,
            package_structure_mismatch: false,
          },
          candidate_components: {
            app: 'mediadownloader',
            domain: 'abc',
            company: 'sadnoxx',
          },
        },
        SemanticSimilarityRule: {
          signal_level: 'medium',
          cosine_similarity: 0.7968869805335999,
        },
        DeveloperConsistencyRule: {
          signal_level: 'very_low',
          developer_similarity: 0.0,
          original_dev_normalized: 'whatsapp',
          candidate_dev_normalized: 'noxx',
        },
      },
      reviewed_by: 'test@email.com',
      reviewed_on: new Date('2026-03-02T05:38:20.791645Z'),
      ignore_reason:
        'Lorem ipsum dolor sit amet consectetur. Tempor morbi aenean ipsum varius. Sapien sit nisl nisi cursus leo augue rhoncus proin. Sit enim ultrices at risus at ultricies felis. Sit feugiat consequat pellentesque eget tempor. Metus blandit nisi neque libero. Aliquam nulla mauris ac neque varius faucibus quis at nibh.',
      added_to_inventory_app: '1',
      created_on: '2026-03-02T05:38:20.791645Z',
    } as StoreknoxFakeAppsDetailsModel;
  }
}
