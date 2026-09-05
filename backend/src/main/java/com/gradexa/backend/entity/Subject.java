package com.gradexa.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "subjects",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "academic_class_id",
                "subject_name"
            }
        )
    }
)
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================================
    // ACADEMIC CLASS
    // ==========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "academic_class_id",
        nullable = false
    )
    private AcademicClass academicClass;

    // ==========================================================
    // SUBJECT NAME
    // ==========================================================

    @Column(
        name = "subject_name",
        nullable = false
    )
    private String subjectName;

    // ==========================================================
    // SUBJECT CATEGORY
    // ==========================================================

    @Enumerated(EnumType.STRING)
    @Column(
        name = "category",
        nullable = false
    )
    private SubjectCategory category;

    // ==========================================================
    // BASKET NUMBER
    // ==========================================================

    /*
     * Core and Primary subjects do not belong to a basket.
     *
     * Basket 01 → 1
     * Basket 02 → 2
     * Basket 03 → 3
     *
     * For Grades 6–9, the basket subjects can use Basket 01.
     */
    @Column(name = "basket_number")
    private Integer basketNumber;

    // ==========================================================
    // DISPLAY ORDER
    // ==========================================================

    /*
     * Controls the order in which subjects appear in the UI
     * and later in marksheets.
     */
    @Column(
        name = "display_order",
        nullable = false
    )
    private Integer displayOrder;

    // ==========================================================
    // CUSTOM SUBJECT
    // ==========================================================

    /*
     * false = default Gradexa subject
     * true  = subject manually added by teacher
     */
    @Column(
        name = "custom",
        nullable = false
    )
    private boolean custom = false;

    // ==========================================================
    // ACTIVE
    // ==========================================================

    @Column(
        name = "active",
        nullable = false
    )
    private boolean active = true;

    // ==========================================================
    // CONSTRUCTORS
    // ==========================================================

    public Subject() {
    }

    public Subject(
        AcademicClass academicClass,
        String subjectName,
        SubjectCategory category,
        Integer basketNumber,
        Integer displayOrder,
        boolean custom,
        boolean active
    ) {
        this.academicClass = academicClass;
        this.subjectName = subjectName;
        this.category = category;
        this.basketNumber = basketNumber;
        this.displayOrder = displayOrder;
        this.custom = custom;
        this.active = active;
    }

    // ==========================================================
    // GETTERS AND SETTERS
    // ==========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AcademicClass getAcademicClass() {
        return academicClass;
    }

    public void setAcademicClass(
        AcademicClass academicClass
    ) {
        this.academicClass = academicClass;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public SubjectCategory getCategory() {
        return category;
    }

    public void setCategory(
        SubjectCategory category
    ) {
        this.category = category;
    }

    public Integer getBasketNumber() {
        return basketNumber;
    }

    public void setBasketNumber(
        Integer basketNumber
    ) {
        this.basketNumber = basketNumber;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(
        Integer displayOrder
    ) {
        this.displayOrder = displayOrder;
    }

    public boolean isCustom() {
        return custom;
    }

    public void setCustom(boolean custom) {
        this.custom = custom;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}