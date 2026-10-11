using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;

namespace Al7.Thabat.Surveys;

[Table("SurveyAnswers")]
[Serializable]
[DisableAuditing]
public class SurveyAnswer : Entity<long>
{
    public virtual long SurveyQuestionId { get; set; }
    [ForeignKey("SurveyQuestionId")]
    public virtual SurveyQuestion? SurveyQuestion { get; set; }
    public virtual string? TitleAr { get; set; }
    public virtual string? TitleEn { get; set; }
    public virtual int Degree { get; set; }
    public virtual int Sort { get; set; }
}
