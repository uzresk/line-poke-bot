package jp.gr.java_conf.uzresk.samples.springbootreact.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Profile {

    private String displayName;

    private String userId;

    private String pictureUrl;

    private String statusMessage;
}
